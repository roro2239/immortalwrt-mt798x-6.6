(function () {
	function byId(id) {
		return document.getElementById(id);
	}

	function setText(id, value) {
		byId(id).textContent = value || "--";
	}

	function setNotice(message, isError) {
		var node = byId("status-message");
		node.textContent = message;
		node.className = isError ? "notice-bar error" : "notice-bar";
	}

	function setSsids(ssids) {
		var list = byId("ssid-list");
		list.innerHTML = "";

		if (!Array.isArray(ssids) || ssids.length === 0) {
			var emptyItem = document.createElement("li");
			emptyItem.textContent = "当前未检测到启用的 SSID";
			list.appendChild(emptyItem);
			return;
		}

		ssids.forEach(function (ssid) {
			var item = document.createElement("li");
			item.textContent = ssid;
			list.appendChild(item);
		});
	}

	function officialUrl() {
		return window.location.protocol + "//" + window.location.hostname + ":2239/";
	}

	function officialPath(path) {
		return officialUrl().replace(/\/$/, "") + path;
	}

	async function loadStatus() {
		setNotice("正在刷新设备状态...", false);

		try {
			var response = await fetch("/cgi-bin/router/status", {
				cache: "no-store",
				headers: {
					"Accept": "application/json"
				}
			});

			if (!response.ok) {
				throw new Error("HTTP " + response.status);
			}

			var data = await response.json();

			setText("hostname", data.hostname);
			setText("lan-ip", data.lan_ip);
			setText("uptime", data.uptime);
			setText("hero-client-count", String(data.client_count || 0));
			setText("wan-status", data.wan_up ? "已连接" : "未连接");
			setText("wan-proto", data.wan_proto);
			setText("wan-ip", data.wan_ip);
			setText("loadavg", data.loadavg);
			setText("wifi-count", String(data.wifi_count || 0));
			setText("wifi-client-count", String(data.client_count || 0));
			setText("client-count", String(data.client_count || 0));
			setText("client-lan-ip", data.lan_ip);
			setText("client-hostname", data.hostname);
			setText("memory-usage", data.memory_usage);
			setText("max-temp", data.max_temp);
			setText("board-name", data.board_name);
			setText("firmware", data.firmware);
			setSsids(data.ssids);

			setNotice("状态已更新，官方后台入口保持在 :2239。", false);
		} catch (error) {
			setNotice("状态加载失败：" + error.message, true);
		}
	}

	byId("official-link").href = officialUrl();
	byId("shortcut-official").href = officialUrl();
	byId("shortcut-network").href = officialPath("/cgi-bin/luci/admin/network/network");
	byId("shortcut-wireless").href = officialPath("/cgi-bin/luci/admin/network/wireless");
	byId("shortcut-system").href = officialPath("/cgi-bin/luci/admin/system/startup");
	byId("refresh-button").addEventListener("click", loadStatus);

	loadStatus();
	window.setInterval(loadStatus, 10000);
})();
