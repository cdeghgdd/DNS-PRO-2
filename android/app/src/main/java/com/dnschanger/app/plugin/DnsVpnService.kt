package com.dnschanger.app.plugin

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.VpnService
import android.os.Build
import android.os.ParcelFileDescriptor
import androidx.core.app.NotificationCompat
import com.dnschanger.app.MainActivity
import java.io.FileInputStream
import java.io.FileOutputStream
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress
import java.net.URL
import javax.net.ssl.HttpsURLConnection
import javax.net.ssl.SSLSocketFactory
import kotlinx.coroutines.*

class DnsVpnService : VpnService() {

    companion object {
        const val ACTION_START = "com.dnschanger.app.START"
        const val ACTION_STOP = "com.dnschanger.app.STOP"
        const val CHANNEL_ID = "dns_vpn_service_channel"
        const val NOTIFICATION_ID = 1001

        var isRunning = false
            private set
        var currentStatus = "disconnected"
            private set
        var currentDnsServers = ArrayList<String>()
            private set
        var currentDnsType = "udp"
            private set
        var currentDohUrl = ""
            private set
        var currentDotDomain = ""
            private set
    }

    private var vpnInterface: ParcelFileDescriptor? = null
    private var serviceScope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent == null) return START_NOT_STICKY
        val action = intent.action
        if (action == ACTION_STOP) {
            stopVpn()
            return START_NOT_STICKY
        }
        if (action == ACTION_START) {
            val servers = intent.getStringArrayListExtra("servers") ?: arrayListOf("1.1.1.1", "1.0.0.1")
            val dnsType = intent.getStringExtra("dnsType") ?: "udp"
            val dohUrl = intent.getStringExtra("dohUrl") ?: ""
            val dotDomain = intent.getStringExtra("dotDomain") ?: ""
            startVpn(servers, dnsType, dohUrl, dotDomain)
        }
        return START_STICKY
    }

    private fun startVpn(servers: ArrayList<String>, dnsType: String, dohUrl: String, dotDomain: String) {
        if (isRunning) {
            stopVpn()
        }
        currentDnsServers = servers
        currentDnsType = dnsType
        currentDohUrl = dohUrl
        currentDotDomain = dotDomain

        createNotificationChannel()
        val notification = createNotification("Connecting to DNS...")
        startForeground(NOTIFICATION_ID, notification)

        try {
            val builder = Builder()
                .setSession("DNSChangerVPN")
                .setMtu(1500)
                .addAddress("10.0.0.2", 32)
                .addAddress("fd00::2", 128)

            for (server in servers) {
                builder.addDnsServer(server)
            }

            for (server in servers) {
                if (server.contains(":")) {
                    builder.addRoute(server, 128)
                } else {
                    builder.addRoute(server, 32)
                }
            }

            vpnInterface = builder.establish()
            if (vpnInterface == null) {
                stopVpn()
                return
            }

            isRunning = true
            currentStatus = "connected"
            updateNotification("Connected to " + servers.joinToString(", "))

            serviceScope.launch {
                runDnsProxy()
            }
        } catch (e: Exception) {
            stopVpn()
        }
    }

    private suspend fun runDnsProxy() {
        val pfd = vpnInterface ?: return
        val inputStream = FileInputStream(pfd.fileDescriptor)
        val outputStream = FileOutputStream(pfd.fileDescriptor)
        val buffer = ByteArray(32767)

        while (isRunning && serviceScope.isActive) {
            try {
                val length = inputStream.read(buffer)
                if (length <= 0) {
                    delay(10)
                    continue
                }
                if (currentDnsServers.isNotEmpty()) {
                    val targetIp = currentDnsServers[0]
                    forwardDnsRequest(buffer, length, targetIp, outputStream)
                }
            } catch (e: Exception) {
                if (!isRunning) break
            }
        }
    }

    private fun forwardDnsRequest(buffer: ByteArray, length: Int, targetIp: String, outputStream: FileOutputStream) {
        try {
            if (currentDnsType == "doh" && currentDohUrl.isNotEmpty()) {
                forwardDoH(buffer, length, currentDohUrl, outputStream)
            } else if (currentDnsType == "dot" && currentDotDomain.isNotEmpty()) {
                forwardDoT(buffer, length, targetIp, currentDotDomain, outputStream)
            } else {
                forwardUdp(buffer, length, targetIp, outputStream)
            }
        } catch (e: Exception) {
        }
    }

    private fun forwardUdp(buffer: ByteArray, length: Int, targetIp: String, outputStream: FileOutputStream) {
        var socket: DatagramSocket? = null
        try {
            socket = DatagramSocket()
            protect(socket)
            val address = InetAddress.getByName(targetIp)
            val packet = DatagramPacket(buffer, length, address, 53)
            socket.send(packet)

            val recvBuffer = ByteArray(32767)
            val recvPacket = DatagramPacket(recvBuffer, recvBuffer.size)
            socket.soTimeout = 3000
            socket.receive(recvPacket)

            outputStream.write(recvBuffer, 0, recvPacket.length)
        } catch (e: Exception) {
        } finally {
            socket?.close()
        }
    }

    private fun forwardDoH(buffer: ByteArray, length: Int, dohUrl: String, outputStream: FileOutputStream) {
        try {
            val url = URL(dohUrl)
            val connection = url.openConnection() as HttpsURLConnection
            protect(connection.url.host)
            connection.requestMethod = "POST"
            connection.setRequestProperty("Content-Type", "application/dns-message")
            connection.setRequestProperty("Accept", "application/dns-message")
            connection.doOutput = true
            connection.connectTimeout = 3000
            connection.readTimeout = 3000

            connection.outputStream.write(buffer, 0, length)
            connection.outputStream.flush()

            if (connection.responseCode == 200) {
                val responseBytes = connection.inputStream.readBytes()
                outputStream.write(responseBytes)
            }
        } catch (e: Exception) {
        }
    }

    private fun forwardDoT(buffer: ByteArray, length: Int, targetIp: String, domain: String, outputStream: FileOutputStream) {
        try {
            val factory = SSLSocketFactory.getDefault()
            val socket = factory.createSocket(targetIp, 853) as javax.net.ssl.SSLSocket
            protect(socket)
            socket.soTimeout = 3000
            socket.startHandshake()

            val out = socket.outputStream
            val dnsPayloadLength = length
            out.write((dnsPayloadLength shr 8) and 0xFF)
            out.write(dnsPayloadLength and 0xFF)
            out.write(buffer, 0, length)
            out.flush()

            val inStream = socket.inputStream
            val len1 = inStream.read()
            val len2 = inStream.read()
            if (len1 != -1 && len2 != -1) {
                val respLen = (len1 shl 8) or len2
                val respBuffer = ByteArray(respLen)
                var bytesRead = 0
                while (bytesRead < respLen) {
                    val read = inStream.read(respBuffer, bytesRead, respLen - bytesRead)
                    if (read == -1) break
                    bytesRead += read
                }
                outputStream.write(respBuffer, 0, bytesRead)
            }
            socket.close()
        } catch (e: Exception) {
        }
    }

    private fun protect(host: String) {
        try {
            val addrs = InetAddress.getAllByName(host)
            for (addr in addrs) {
                val dummySocket = DatagramSocket()
                protect(dummySocket)
                dummySocket.close()
            }
        } catch (e: Exception) {
        }
    }

    private fun stopVpn() {
        isRunning = false
        currentStatus = "disconnected"
        serviceScope.cancel()
        serviceScope = CoroutineScope(Dispatchers.IO + SupervisorJob())

        try {
            vpnInterface?.close()
            vpnInterface = null
        } catch (e: Exception) {
        }

        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    override fun onDestroy() {
        stopVpn()
        super.onDestroy()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "DNS Changer VPN Service",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    private fun createNotification(contentText: String): Notification {
        val mainIntent = Intent(this, MainActivity::class.java)
        val pendingMainIntent = PendingIntent.getActivity(
            this, 0, mainIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val stopIntent = Intent(this, DnsVpnService::class.java).apply {
            action = ACTION_STOP
        }
        val pendingStopIntent = PendingIntent.getService(
            this, 0, stopIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("DNS Changer")
            .setContentText(contentText)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentIntent(pendingMainIntent)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Disconnect", pendingStopIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun updateNotification(contentText: String) {
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(NOTIFICATION_ID, createNotification(contentText))
    }
}
