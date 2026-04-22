#!/bin/sh

json_escape() {
	printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

format_uptime() {
	local total="$1"
	local days hours mins

	days=$((total / 86400))
	hours=$(((total % 86400) / 3600))
	mins=$(((total % 3600) / 60))

	if [ "$days" -gt 0 ]; then
		printf '%s天%s小时%s分钟' "$days" "$hours" "$mins"
	else
		printf '%s小时%s分钟' "$hours" "$mins"
	fi
}

read_mem_value() {
	local key="$1"
	awk -v k="$key" '$1 == k ":" { print $2; exit }' /proc/meminfo
}

board_json="$(ubus call system board 2>/dev/null)"
lan_json="$(ubus call network.interface.lan status 2>/dev/null)"
wan_json="$(ubus call network.interface.wan status 2>/dev/null)"

hostname="$(printf '%s' "$board_json" | jsonfilter -e '@.hostname' 2>/dev/null)"
board_name="$(printf '%s' "$board_json" | jsonfilter -e '@.model' 2>/dev/null)"
firmware="$(printf '%s' "$board_json" | jsonfilter -e '@.release.description' 2>/dev/null)"
lan_ip="$(printf '%s' "$lan_json" | jsonfilter -e '@["ipv4-address"][0].address' 2>/dev/null)"
wan_ip="$(printf '%s' "$wan_json" | jsonfilter -e '@["ipv4-address"][0].address' 2>/dev/null)"
wan_up_raw="$(printf '%s' "$wan_json" | jsonfilter -e '@.up' 2>/dev/null)"
wan_proto="$(uci -q get network.wan.proto)"

[ -n "$hostname" ] || hostname="$(uci -q get system.@system[0].hostname)"
[ -n "$board_name" ] || board_name="未知型号"
[ -n "$firmware" ] || firmware="未知版本"
[ -n "$lan_ip" ] || lan_ip="$(uci -q get network.lan.ipaddr)"
[ -n "$wan_ip" ] || wan_ip="未获取"
[ -n "$wan_proto" ] || wan_proto="未知"

case "$wan_up_raw" in
	1|true)
		wan_up_json=true
		;;
	*)
		wan_up_json=false
		;;
esac

uptime_raw="$(cut -d'.' -f1 /proc/uptime 2>/dev/null)"
[ -n "$uptime_raw" ] || uptime_raw=0
uptime_text="$(format_uptime "$uptime_raw")"
loadavg="$(cut -d' ' -f1-3 /proc/loadavg 2>/dev/null)"
[ -n "$loadavg" ] || loadavg="0.00 0.00 0.00"

mem_total="$(read_mem_value MemTotal)"
mem_available="$(read_mem_value MemAvailable)"
[ -n "$mem_total" ] || mem_total=0
[ -n "$mem_available" ] || mem_available=0

if [ "$mem_total" -gt 0 ]; then
	mem_used=$((mem_total - mem_available))
	mem_usage_pct=$((mem_used * 100 / mem_total))
	mem_usage="${mem_usage_pct}% (${mem_used}KB / ${mem_total}KB)"
else
	mem_usage="未知"
fi

max_temp_raw=0
for temp_file in /sys/class/thermal/thermal_zone*/temp; do
	[ -f "$temp_file" ] || continue
	temp_value="$(cat "$temp_file" 2>/dev/null)"
	case "$temp_value" in
		''|*[!0-9]*)
			continue
			;;
	esac
	if [ "$temp_value" -gt "$max_temp_raw" ]; then
		max_temp_raw="$temp_value"
	fi
done

if [ "$max_temp_raw" -gt 0 ]; then
	max_temp="$(awk "BEGIN { printf \"%.1f°C\", ${max_temp_raw} / 1000 }")"
else
	max_temp="未检测到"
fi

wifi_count=0
ssids_json=""
ssid_lines="$(uci -q show wireless | sed -n "s/^wireless\.\([^.]*\)\.ssid='\(.*\)'$/\1|\2/p")"

if [ -n "$ssid_lines" ]; then
	while IFS='|' read -r section ssid; do
		[ -n "$section" ] || continue
		disabled="$(uci -q get wireless.${section}.disabled)"
		[ "$disabled" = "1" ] && continue

		ssid_escaped="$(json_escape "$ssid")"
		if [ -n "$ssids_json" ]; then
			ssids_json="${ssids_json},"
		fi
		ssids_json="${ssids_json}\"${ssid_escaped}\""
		wifi_count=$((wifi_count + 1))
	done <<EOF
$ssid_lines
EOF
fi

client_count="$(ip neigh show dev br-lan 2>/dev/null | awk '{ state=$NF; if ($1 != "" && state != "FAILED" && !seen[$1]++) count++ } END { print count + 0 }')"
[ -n "$client_count" ] || client_count=0

printf 'Content-Type: application/json\r\n'
printf 'Cache-Control: no-store\r\n'
printf '\r\n'
printf '{'
printf '"hostname":"%s",' "$(json_escape "$hostname")"
printf '"board_name":"%s",' "$(json_escape "$board_name")"
printf '"firmware":"%s",' "$(json_escape "$firmware")"
printf '"lan_ip":"%s",' "$(json_escape "$lan_ip")"
printf '"wan_ip":"%s",' "$(json_escape "$wan_ip")"
printf '"wan_proto":"%s",' "$(json_escape "$wan_proto")"
printf '"wan_up":%s,' "$wan_up_json"
printf '"uptime":"%s",' "$(json_escape "$uptime_text")"
printf '"loadavg":"%s",' "$(json_escape "$loadavg")"
printf '"memory_usage":"%s",' "$(json_escape "$mem_usage")"
printf '"max_temp":"%s",' "$(json_escape "$max_temp")"
printf '"wifi_count":%s,' "$wifi_count"
printf '"client_count":%s,' "$client_count"
printf '"ssids":[%s]' "$ssids_json"
printf '}'
