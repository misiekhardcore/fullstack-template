import sgMail from "@sendgrid/mail";
import { config } from "dotenv";

config();

sgMail.setApiKey(process.env.SENDGRID_KEY || "");

const sendMail = async (
  email: string,
  subject: string,
  text: string,
  html: string
): Promise<boolean> => {
  try {
    const msg = {
      to: email,
      from: process.env.SENDGRID_EMAIL || "",
      subject,
      text,
      html,
    };
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error(error.response.body);
    return false;
  }
};

export default sendMail;
