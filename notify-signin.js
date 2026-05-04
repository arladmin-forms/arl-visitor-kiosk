// Vercel Serverless Function — /api/notify-signin
// This runs server-side, so your API key stays secret

const sgMail = require("@sendgrid/mail");
const PDFDocument = require("pdfkit");

module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // CORS headers for the kiosk frontend
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const {
      firstName, lastName, company, email,
      hostName, purpose, emailOptIn, signature,
    } = req.body;

    if (!firstName || !lastName || !company || !email || !hostName || !purpose) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Set up SendGrid
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", {
      hour: "numeric", minute: "2-digit", hour12: true, timeZone: "America/Los_Angeles",
    });
    const dateStr = now.toLocaleDateString("en-US", {
      month: "2-digit", day: "2-digit", year: "numeric", timeZone: "America/Los_Angeles",
    });

    // Generate signed NDA PDF
    const pdfBuffer = await generateSignedNDA({ firstName, lastName, company, signature, dateStr, timeStr });

    // Send email
    const msg = {
      to: process.env.NOTIFY_EMAIL || "Jared@aboverinaldilabs.com",
      from: {
        email: process.env.SENDER_EMAIL || "jared@aboverinaldilabs.com",
        name: "ARL Visitor Kiosk",
      },
      subject: `${firstName} ${lastName} has signed in at ${timeStr}`,
      text: [
        `Date: ${dateStr}`,
        `Time: ${timeStr}`,
        `Name: ${firstName} ${lastName}`,
        `Company: ${company}`,
        `Purpose of Visit: ${purpose}`,
        `Email: ${email}`,
        `Host: ${hostName}`,
        `Email Subscription: ${emailOptIn === "yes" ? "Yes — Opted In" : "No — Declined"}`,
        ``,
        `---`,
        `Mutual NDA: Signed ✓`,
        `Signature captured digitally at ${timeStr} on ${dateStr}`,
        ``,
        `Signed NDA is attached to this email.`,
      ].join("\n"),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <div style="background: #1a1a2e; padding: 20px 24px; border-radius: 12px 12px 0 0;">
            <h2 style="color: white; margin: 0; font-size: 18px;">Visitor Sign-In Notification</h2>
          </div>
          <div style="background: #f8f8fc; padding: 24px; border: 1px solid #e0e0ea; border-top: none; border-radius: 0 0 12px 12px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 8px 0; color: #6a6a8a; width: 140px;">Date</td><td style="padding: 8px 0; font-weight: 600;">${dateStr}</td></tr>
              <tr><td style="padding: 8px 0; color: #6a6a8a;">Time</td><td style="padding: 8px 0; font-weight: 600;">${timeStr}</td></tr>
              <tr><td style="padding: 8px 0; color: #6a6a8a;">Name</td><td style="padding: 8px 0; font-weight: 600;">${firstName} ${lastName}</td></tr>
              <tr><td style="padding: 8px 0; color: #6a6a8a;">Company</td><td style="padding: 8px 0; font-weight: 600;">${company}</td></tr>
              <tr><td style="padding: 8px 0; color: #6a6a8a;">Purpose of Visit</td><td style="padding: 8px 0; font-weight: 600;">${purpose}</td></tr>
              <tr><td style="padding: 8px 0; color: #6a6a8a;">Email</td><td style="padding: 8px 0; font-weight: 600;"><a href="mailto:${email}">${email}</a></td></tr>
              <tr><td style="padding: 8px 0; color: #6a6a8a;">Host</td><td style="padding: 8px 0; font-weight: 600;">${hostName}</td></tr>
              <tr><td style="padding: 8px 0; color: #6a6a8a;">Email Subscription</td><td style="padding: 8px 0; font-weight: 600;">${emailOptIn === "yes" ? "✅ Yes — Opted In" : "❌ No — Declined"}</td></tr>
            </table>
            <div style="margin-top: 16px; padding: 12px 16px; background: #e8fae8; border-radius: 8px; color: #2a7a2a; font-size: 14px;">
              ✓ Mutual NDA signed — see attached PDF
            </div>
          </div>
        </div>
      `,
      attachments: [
        {
          content: pdfBuffer.toString("base64"),
          filename: `Signed_MNDA_${firstName}_${lastName}_${dateStr.replace(/\//g, "-")}.pdf`,
          type: "application/pdf",
          disposition: "attachment",
        },
      ],
    };

    await sgMail.send(msg);
    console.log(`✓ Sign-in notification sent for ${firstName} ${lastName} at ${timeStr}`);
    res.status(200).json({ success: true, message: "Notification sent" });
  } catch (error) {
    console.error("Email send failed:", error?.response?.body || error.message);
    res.status(500).json({
      error: "Failed to send notification",
      details: error?.response?.body?.errors || error.message,
    });
  }
};

// ── PDF Generation ──────────────────────────────────────────────
function generateSignedNDA({ firstName, lastName, company, signature, dateStr, timeStr }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "LETTER", margins: { top: 60, bottom: 60, left: 60, right: 60 } });
      const buffers = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      const pageWidth = 612 - 120;
      const bodyFont = "Helvetica";
      const boldFont = "Helvetica-Bold";
      const bodySize = 9;

      // Header
      doc.fontSize(10).font(bodyFont).text("Mutual Non-Disclosure Agreement", { align: "left" });
      doc.text("Confidential Information of Above Rinaldi Laboratories Inc.", { align: "left" });
      doc.moveDown(1);
      doc.fontSize(14).font(boldFont).text("MUTUAL NON-DISCLOSURE AGREEMENT", { align: "right" });
      doc.moveDown(2);

      // Preamble
      doc.fontSize(bodySize).font(boldFont).text("THIS MUTUAL NON-DISCLOSURE AGREEMENT ", { continued: true });
      doc.font(bodyFont).text(`(the "Agreement") is dated effective as of ${dateStr} (the "Effective Date") by and between ${firstName} ${lastName}, representing ${company} ("Customer") and Above Rinaldi Laboratories Inc., having offices located at 19821 Nordhoff Place., Suite 112, Chatsworth, CA 91311 ("ARL"). Customer and ARL are referred to herein individually as a "Party" and collectively as the "Parties."`);
      doc.moveDown(0.5);
      doc.text(`WHEREAS, the Parties intend to disclose to each other confidential information in connection with discussions of a potential business relationship relating to cosmeceutical, nutraceutical, personal care and wellness products for the health and beauty industry ("Purpose").`);
      doc.moveDown(0.5);
      doc.text(`NOW, THEREFORE, in consideration of the promises, mutual covenants and agreements set forth herein, and other good and valuable consideration, the receipt, sufficiency and adequacy of which are hereby acknowledged, the parties, intending to be legally bound, agree as follows:`);
      doc.moveDown(0.8);

      const sections = [
        { num: "1", title: "Definition", text: `"Confidential Information" means all non-public proprietary or confidential information that is supplied by the disclosing Party ("Disclosing Party"), or its affiliates and their respective employees contractors and advisors ("Representatives"), during the term of this Agreement to either the Party receiving the information ("Receiving Party") or its Representatives, that is in oral, visual, written, electronic or other tangible or intangible form, whether or not marked or designated as confidential, and all notes, analyses, summaries and other materials prepared by Receiving Party or its Representatives that contain, are based on or otherwise reflect such information. Confidential Information includes all trade secrets and proprietary and confidential information and know-how relating to products, services, designs, software, documentation, strategies, pricing, employees, negotiations and contracts with other companies, permits, licenses, regulatory approvals, procedures, research, sources, customer lists, concepts, and any other subject matter pertaining to the business of the Disclosing Party, its affiliates and their clients, customers, suppliers, vendors or creditors.` },
        { num: "2", title: "Exclusions", text: `Confidential Information does not include any information that: (a) is or becomes generally available to the public other than as a result of Receiving Party's or its Representatives' breach of this Agreement; (b) is obtained by Receiving Party or its Representatives on a non-confidential basis from a third-party that was not legally restricted from disclosing such information; (c) was in the Receiving Party's or its Representatives' possession prior to Disclosing Party's disclosure without restriction on use or disclosure; (d) was or is independently developed by Receiving Party or its Representatives without using any Confidential Information; or (e) is approved for release by written authorization of the Disclosing Party, but only to the extent of such authorization.` },
        { num: "3", title: "Use and Disclosure", text: `The Receiving Party shall (a) use the Confidential Information solely for the Purpose; (b) not disclose the Confidential Information other than to its Representatives who need access to Confidential Information for the Purpose, are informed of its confidential nature, and are bound by confidentiality obligations no less protective than this Agreement; (c) cause its Representatives to comply with this Agreement, and agree to be liable for their breach; and (d) safeguard the Confidential Information from unauthorized use, access or disclosure using at least the degree of care it uses to protect its similar information.` },
        { num: "4", title: "Legal Disclosure", text: `If Receiving Party or any of its Representatives is required by applicable law or a valid legal order to disclose any Confidential Information, Receiving Party shall notify Disclosing Party so that Disclosing Party may seek a protective order or other remedy. Receiving Party shall provide reasonable assistance in seeking such order. If Receiving Party remains legally compelled to make the disclosure, it may only disclose that required portion of the Confidential Information and must use reasonable efforts to ensure its confidential treatment.` },
        { num: "5", title: "Return or Destruction", text: `At the Disclosing Party's request, Receiving Party shall promptly return or destroy all Confidential Information in its and its Representatives' possession. Receiving Party may retain copies that are stored solely for archival or legal retention until its deletion in the ordinary course.` },
        { num: "6", title: "No Obligation or License", text: `This Agreement imposes no obligation on either Party to disclose any Confidential Information or to negotiate for, enter into or otherwise pursue the Purpose. Disclosing Party retains its entire right, title and interest in and to all Confidential Information, and no disclosure under this Agreement will be construed as a license, assignment or other transfer of any such right, title and interest to Receiving Party.` },
        { num: "7", title: "Non-Solicitation; Non-Competition; Non-Disparagement", text: `The Parties agree that during the term of this Agreement and for one year thereafter, it will not, directly or indirectly, for itself or on behalf of, or in conjunction with, any other person (a) hire or attempt to hire any person that is an employee of the Parties or was an employee within six months prior to the date of the termination of this Agreement; or (b) solicit, advise, or encourage any person, firm, government agency or corporation to withdraw, curtail or cancel its business with the Parties or attempt to engage in a direct business relationship with any Client introduced or referred to either Party during the term of this agreement, unless the engaging Party had a pre-existing business relationship with the Client or obtains prior written consent from the other Party.` },
        { num: "8", title: "Term", text: `The term of this Agreement will end 3 years after the Effective Date, but either Party may terminate this Agreement earlier with 30 days' written notice. Sections 1, 2, 3, 4, 5, 8 and 9 shall survive for 3 years after the effective date of such termination.` },
        { num: "9", title: "Remedy", text: `The Parties agree that money damages may not be a sufficient remedy for breach of this Agreement and that the Disclosing Party shall be entitled, without posting security, to injunctive or other equitable relief to remedy or forestall any such breach or threatened breach, in addition to other remedies available at law or in equity.` },
        { num: "10", title: "Miscellaneous", text: `Neither Party may assign any of its rights or delegate its performance arising under or relating to this Agreement to any unaffiliated third party without the prior written consent of the other Party. In the event of any dispute between ARL and Customer, such dispute shall be resolved by arbitration through JAMS using its Comprehensive Arbitration Rules and Procedures then in effect. The arbitration shall be before a single arbitrator in Los Angeles and shall be a final binding resolution. All matters arising from or relating to this Agreement shall be governed by the internal substantive laws of the State of California. This Agreement constitutes the final agreement between the Parties and supersedes all prior and contemporaneous negotiations and agreements relating to the subject matter of this Agreement.` },
      ];

      for (const section of sections) {
        if (doc.y > 660) {
          doc.addPage();
          doc.fontSize(8).font(bodyFont).text("Mutual Non-Disclosure Agreement", 60, 40);
          doc.text("Confidential Information of Above Rinaldi Laboratories Inc.", 60, 50);
          doc.moveDown(2);
        }
        doc.fontSize(bodySize).font(boldFont).text(`${section.num}. ${section.title}.`, { continued: false });
        doc.font(bodyFont).text(section.text);
        doc.moveDown(0.5);
      }

      // Signature page
      doc.addPage();
      doc.fontSize(8).font(bodyFont).text("Mutual Non-Disclosure Agreement", 60, 40);
      doc.text("Confidential Information of Above Rinaldi Laboratories Inc.", 60, 50);
      doc.moveDown(3);
      doc.fontSize(bodySize).font(boldFont).text("IN WITNESS WHEREOF, the Parties hereby agree to the terms and conditions of this Agreement.");
      doc.moveDown(2);

      const sigY = doc.y;
      doc.font(bodyFont).text("By:", 60, sigY);

      if (signature && signature.startsWith("data:image")) {
        const sigData = signature.replace(/^data:image\/\w+;base64,/, "");
        const sigBuffer = Buffer.from(sigData, "base64");
        doc.image(sigBuffer, 90, sigY - 10, { width: 160, height: 50 });
      }

      doc.moveDown(2);
      doc.text("_______________________________", 60);
      doc.text(`Name: ${firstName} ${lastName}`, 60);
      doc.moveDown(0.5);
      doc.text("Title: ___________________________", 60);
      doc.moveDown(0.5);
      doc.text(`Date: ${dateStr}`, 60);
      doc.moveDown(0.5);
      doc.text(`Time: ${timeStr} (Digital Signature)`, 60);

      doc.fontSize(bodySize).font(bodyFont).text("Above Rinaldi Laboratories Inc.", 340, sigY - 30);
      doc.text("By: Fred Khoury", 340, sigY + 20);
      doc.text("_______________________________", 340);
      doc.text("Name: Fred Khoury", 340);
      doc.moveDown(0.5);
      doc.text("Title: President", 340, doc.y);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
