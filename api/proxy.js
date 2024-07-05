import axios from "axios";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,OPTIONS,PATCH,DELETE,POST,PUT"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
    );
    res.status(200).end();
    return;
  }

  if (req.method === "POST") {
    try {
      const response = await axios.post(
        "https://aat7sty0nd.execute-api.eu-north-1.amazonaws.com/Prod/llm/prompt",
        req.body,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      res.setHeader("Access-Control-Allow-Origin", "*");
      res.status(200).json(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error processing request" });
    }
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST");
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
