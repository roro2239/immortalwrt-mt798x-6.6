include $(TOPDIR)/rules.mk

PKG_NAME:=router-webui
PKG_RELEASE:=1
PKG_LICENSE:=MIT
PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

define Package/router-webui
  SECTION:=mtk
  CATEGORY:=MTK Properties
  TITLE:=Custom router web UI with official LuCI fallback
  DEPENDS:=+uhttpd +jsonfilter
endef

define Package/router-webui/description
 Custom router homepage on port 80 with official LuCI on port 2239.
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
endef

define Build/Compile
endef

define Package/router-webui/install
	$(INSTALL_DIR) $(1)/etc/uci-defaults
	$(INSTALL_DIR) $(1)/www-custom
	$(INSTALL_DIR) $(1)/www-custom/assets
	$(INSTALL_DIR) $(1)/www-custom/cgi-bin/router
	$(INSTALL_DIR) $(1)/www-official
	$(INSTALL_BIN) ./files/99-router-webui $(1)/etc/uci-defaults/99-router-webui
	$(INSTALL_BIN) ./files/status.cgi $(1)/www-custom/cgi-bin/router/status
	$(INSTALL_DATA) ./files/custom-index.html $(1)/www-custom/index.html
	$(INSTALL_DATA) ./files/app.css $(1)/www-custom/assets/app.css
	$(INSTALL_DATA) ./files/app.js $(1)/www-custom/assets/app.js
	$(INSTALL_DATA) ./files/official-index.html $(1)/www-official/index.html
endef

$(eval $(call BuildPackage,router-webui))
