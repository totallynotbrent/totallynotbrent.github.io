import sys, json, base64, time, urllib.request
import websocket

def shot(url, out, port="9222", dark=False):
    # open a fresh tab via /json/new
    req = urllib.request.Request(f"http://127.0.0.1:{port}/json/new?{url}", method="PUT")
    try:
        tab = json.load(urllib.request.urlopen(req))
    except Exception as e:
        print("new tab failed", e); sys.exit(1)

    ws = websocket.create_connection(tab["webSocketDebuggerUrl"], timeout=60, suppress_origin=True)
    mid = [0]
    done = [False]

    def cdp(method, params=None):
        mid[0] += 1
        ws.send(json.dumps({"id": mid[0], "method": method, "params": params or {}}))
        while True:
            m = json.loads(ws.recv())
            if m.get("id") == mid[0]:
                return m.get("result", {})

    cdp("Page.enable")
    cdp("Emulation.setDeviceMetricsOverride",
        {"width": 1280, "height": 900, "deviceScaleFactor": 2, "mobile": False})
    if dark:
        cdp("Emulation.setEmulatedMedia", {"features": [{"name": "prefers-color-scheme", "value": "dark"}]})
    cdp("Page.navigate", {"url": url})
    time.sleep(4)
    res = cdp("Page.captureScreenshot", {"format": "png", "captureBeyondViewport": False})
    open(out, "wb").write(base64.b64decode(res["data"]))
    # close tab
    try:
        cdp("Page.close")
    except Exception:
        pass
    ws.close()
    print("wrote", out)

if __name__ == "__main__":
    url, out, port = sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else "9222"
    dark = len(sys.argv) > 4 and sys.argv[4] == "dark"
    shot(url, out, port, dark=dark)