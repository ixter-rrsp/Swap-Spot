from playwright.sync_api import sync_playwright
import json
with sync_playwright() as p:
    browser = p.chromium.launch()
    iphone = p.devices['iPhone 14']
    context = browser.new_context(**iphone)
    page = context.new_page()
    page.goto('http://127.0.0.1:3000/login')
    page.screenshot(path='C:/Users/princ/OneDrive/Desktop/swapSpot/login-mobile.png', full_page=True)
    body_size = page.evaluate('''() => ({ w: document.body.clientWidth, h: document.body.clientHeight, scrollH: document.body.scrollHeight, htmlH: document.documentElement.clientHeight, htmlScrollH: document.documentElement.scrollHeight })''')
    print(json.dumps(body_size))
    browser.close()
