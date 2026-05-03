import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 375, 'height': 812},
            device_scale_factor=2,
        )
        page = await context.new_page()
        await page.goto('http://localhost:8080')
        await page.wait_for_timeout(3000)
        
        display = await page.evaluate("window.getComputedStyle(document.querySelector('.bee-cursor-holder')).display")
        opacity = await page.evaluate("window.getComputedStyle(document.querySelector('.bee-cursor-holder')).opacity")
        rect = await page.evaluate("document.querySelector('.bee-green.green-follow').getBoundingClientRect()")
        
        print(f"bee-cursor-holder display: {display}")
        print(f"bee-cursor-holder opacity: {opacity}")
        print(f"bee-green rect: x={rect['x']}, y={rect['y']}, width={rect['width']}, height={rect['height']}")
        
        await page.screenshot(path='mobile_test.png')
        await browser.close()

asyncio.run(main())
