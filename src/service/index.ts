interface EmailData {
  email: string;
  phone: string;
  description: string;
  name: string;
  optionsSummaryText: string[];
}

declare global {
  interface Window {
    gtag_report_conversion: (url?: string) => void;
  }
}

export const sendEmail = async (data: EmailData): Promise<any> => {
  const baseUrl = "https://lemamon-email-service-eac435b5f8e8.herokuapp.com";

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

    if (typeof window.gtag_report_conversion === "function") {
      window.gtag_report_conversion();
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
