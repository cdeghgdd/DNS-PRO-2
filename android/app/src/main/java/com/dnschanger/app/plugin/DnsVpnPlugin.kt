package com.dnschanger.app.plugin

import android.app.Activity
import android.content.Intent
import android.net.VpnService
import androidx.activity.result.ActivityResult
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.ActivityCallback
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "DnsVpn")
class DnsVpnPlugin : Plugin() {

    @PluginMethod
    fun requestPermission(call: PluginCall) {
        val intent = VpnService.prepare(context)
        if (intent != null) {
            startActivityForResult(call, intent, "handleVpnPermissionResult")
        } else {
            val ret = JSObject()
            ret.put("granted", true)
            call.resolve(ret)
        }
    }

    @ActivityCallback
    private fun handleVpnPermissionResult(call: PluginCall, result: ActivityResult) {
        val ret = JSObject()
        if (result.resultCode == Activity.RESULT_OK) {
            ret.put("granted", true)
        } else {
            ret.put("granted", false)
        }
        call.resolve(ret)
    }

    @PluginMethod
    fun start(call: PluginCall) {
        val prepareIntent = VpnService.prepare(context)
        if (prepareIntent != null) {
            val ret = JSObject()
            ret.put("success", false)
            ret.put("error", "VPN permission not granted")
            call.resolve(ret)
            return
        }

        val serversArray = call.getArray("servers", JSArray())
        val serversList = ArrayList<String>()
        if (serversArray != null) {
            for (i in 0 until serversArray.length()) {
                serversList.add(serversArray.getString(i))
            }
        }
        val dnsType = call.getString("dnsType", "udp") ?: "udp"
        val dohUrl = call.getString("dohUrl", "") ?: ""
        val dotDomain = call.getString("dotDomain", "") ?: ""

        val intent = Intent(context, DnsVpnService::class.java).apply {
            action = DnsVpnService.ACTION_START
            putStringArrayListExtra("servers", serversList)
            putExtra("dnsType", dnsType)
            putExtra("dohUrl", dohUrl)
            putExtra("dotDomain", dotDomain)
        }

        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            context.startForegroundService(intent)
        } else {
            context.startService(intent)
        }

        val ret = JSObject()
        ret.put("success", true)
        call.resolve(ret)
    }

    @PluginMethod
    fun stop(call: PluginCall) {
        val intent = Intent(context, DnsVpnService::class.java).apply {
            action = DnsVpnService.ACTION_STOP
        }
        context.startService(intent)
        val ret = JSObject()
        ret.put("success", true)
        call.resolve(ret)
    }

    @PluginMethod
    fun status(call: PluginCall) {
        val ret = JSObject()
        ret.put("status", DnsVpnService.currentStatus)
        ret.put("isRunning", DnsVpnService.isRunning)
        val serversArray = JSArray()
        for (server in DnsVpnService.currentDnsServers) {
            serversArray.put(server)
        }
        ret.put("servers", serversArray)
        ret.put("dnsType", DnsVpnService.currentDnsType)
        call.resolve(ret)
    }

    @PluginMethod
    fun isRunning(call: PluginCall) {
        val ret = JSObject()
        ret.put("isRunning", DnsVpnService.isRunning)
        call.resolve(ret)
    }

    @PluginMethod
    fun getCurrentDNS(call: PluginCall) {
        val ret = JSObject()
        val serversArray = JSArray()
        for (server in DnsVpnService.currentDnsServers) {
            serversArray.put(server)
        }
        ret.put("servers", serversArray)
        ret.put("dnsType", DnsVpnService.currentDnsType)
        ret.put("dohUrl", DnsVpnService.currentDohUrl)
        ret.put("dotDomain", DnsVpnService.currentDotDomain)
        call.resolve(ret)
    }
}
