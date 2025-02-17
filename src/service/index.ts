interface EmailData {
  email: string;
  phone: string;
  description: string;
  name: string;
  optionsSummaryText: string[];
}

export const sendEmail = async (data: EmailData): Promise<any> => {
  const baseUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://my-website.com";

  try {
    const response = await fetch(`${baseUrl}/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
