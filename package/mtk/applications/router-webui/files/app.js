(function () {
	function byId(id) {
		return document.getElementById(id);
	}

	function setText(id, value) {
		var node = byId(id);

		if (node) {
			node.textContent = value || "--";
		}
	}

	function setHref(id, value) {
		var node = byId(id);

		if (node) {
			node.href = value;
		}
	}

	function firstSsid(ssids) {
		if (!Array.isArray(ssids) || ssids.length === 0) {
			return "未检测到";
		}

		return ssids[0];
	}

	function setNotice(message, isError) {
		var node = byId("status-message");

		if (node) {
			node.textContent = message;
			node.className = isError ? "notice-bar error" : "notice-bar";
		}
	}

	function setSsids(ssids) {
		var list = byId("ssid-list");

		if (!list) {
			return;
		}

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
		return "//" + window.location.hostname + ":2239/";
	}

	function isPreviewMode() {
		return window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";
	}

	function previewPath(section) {
		return "/preview/" + section;
	}

	function officialPath(path) {
		return officialUrl().replace(/\/$/, "") + path;
	}

	function pagePath(section, official) {
		return isPreviewMode() ? previewPath(section) : officialPath(official);
	}

	function toggleSidebar() {
		var sidebar = byId("sidebar");

		if (sidebar) {
			sidebar.classList.toggle("open");
		}
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
			setText("hostname-top", data.hostname);
			setText("lan-ip", data.lan_ip);
			setText("uptime", data.uptime);
			setText("wan-status", data.wan_up ? "已连接" : "未连接");
			setText("wan-proto", data.wan_proto);
			setText("wan-ip", data.wan_ip);
			setText("loadavg", data.loadavg);
			setText("wifi-count", String(data.wifi_count || 0));
			setText("wifi-client-count", String(data.client_count || 0));
			setText("client-count", String(data.client_count || 0));
			setText("client-hostname", data.hostname);
			setText("memory-usage", data.memory_usage);
			setText("max-temp", data.max_temp);
			setText("board-name", data.board_name);
			setText("firmware", data.firmware);
			setText("device-hostname", data.hostname);
			setText("primary-ssid", firstSsid(data.ssids));
			setSsids(data.ssids);

			setNotice("状态已更新，官方后台入口保持在 :2239。", false);
		} catch (error) {
			setNotice("状态加载失败：" + error.message, true);
		}
	}

	setHref("official-link", isPreviewMode() ? previewPath("system") : officialUrl());
	setHref("nav-network", pagePath("network", "/cgi-bin/luci/admin/network/network"));
	setHref("nav-wireless", pagePath("wifi", "/cgi-bin/luci/admin/network/wireless"));
	setHref("nav-devices", pagePath("devices", "/cgi-bin/luci/admin/status/routes"));
	setHref("nav-system", pagePath("system", "/cgi-bin/luci/admin/system/startup"));
	setHref("shortcut-official", isPreviewMode() ? previewPath("system") : officialUrl());
	setHref("shortcut-network", pagePath("network", "/cgi-bin/luci/admin/network/network"));
	setHref("shortcut-wireless", pagePath("wifi", "/cgi-bin/luci/admin/network/wireless"));
	setHref("shortcut-devices", pagePath("devices", "/cgi-bin/luci/admin/network/dhcp"));
	setHref("shortcut-system", pagePath("system", "/cgi-bin/luci/admin/system/startup"));

	{
		var navToggle = byId("nav-toggle");

		if (navToggle) {
			navToggle.addEventListener("click", toggleSidebar);
		}
	}

	loadStatus();
	window.setInterval(loadStatus, 10000);
})();
