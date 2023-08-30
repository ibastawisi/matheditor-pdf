import puppeteer from '@cloudflare/puppeteer'

interface Env {
  MYBROWSER: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const browser = await puppeteer.launch(env.MYBROWSER);
    const page = await browser.newPage()
    const url = new URL(request.url);
    const id = url.pathname.split("/")[2];
    url.pathname = `/embed/${id}`;
    await page.goto(url.toString(), { waitUntil: "networkidle0" })
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0.4in",
        right: "0.4in",
        bottom: "0.4in",
        left: "0.4in",
      },
    })
    const title = await page.title()
    await browser.close()

    try {
      return new Response(pdf, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${title}.pdf"`,
        },
        status: 200
       })

    } catch (e) {
      return new Response('Something went wrong', { status: 500 })
    }
  }
}