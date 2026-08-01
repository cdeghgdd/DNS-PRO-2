package com.dnschanger.app

import android.os.Bundle
import com.dnschanger.app.plugin.DnsVpnPlugin
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        registerPlugin(DnsVpnPlugin::class.java)
        super.onCreate(savedInstanceState)
    }
}
