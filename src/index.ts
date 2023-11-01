import puppeteer from '@cloudflare/puppeteer'

interface Env {
  MYBROWSER: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const browser = await puppeteer.launch(env.MYBROWSER);
    const page = await browser.newPage()
    const url = new URL(request.url);
    const search = url.searchParams;
    const scale = search.get("scale") || "1";
    const format = (search.get("format") || "A4") as puppeteer.PaperFormat;
    const landscape = search.get("landscape") || "false";
    const handle = url.pathname.split("/")[2];
    url.pathname = `/embed/${handle}`;
    await page.goto(url.toString(), { waitUntil: "networkidle0" })
    try {
      const pdf = await page.pdf({
        scale: Number(scale),
        format,
        landscape: landscape === "true",
        printBackground: true,
        margin: {
          top: "0.4in",
          right: "0.4in",
          bottom: "0.4in",
          left: "0.4in",
        },
      })
      await browser.close()
      return new Response(pdf, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${handle}.pdf"`,
        },
        status: 200
      })
    } catch (e) {
      console.error(e);
      await browser.close();
      return new Response('Something went wrong', { status: 500 })
    }
  }
}