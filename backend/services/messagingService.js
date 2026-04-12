import twilio from 'twilio';

// In ES modules, dotenv is loaded in server.js AFTER imports. 
// So we must initialize the client inside the function exactly when it is called!
export const sendBookingConfirmation = async (user, appointment) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

  const client = accountSid && authToken ? twilio(accountSid, authToken) : null;
  const { _id, date, department, timeSlot, patientName } = appointment;
  const name = patientName || user?.username || 'Patient';
  const phone = user?.phone || 'N/A';

  const ticketUrl = `http://localhost:5173`; // Link to the portal to view the QR Code
  
  const messageBody = `Hello ${name},\n\nYour OPD appointment is CONFIRMED! ✅\n\nTicket ID: ${_id.toString().toUpperCase().slice(-6)}\nPatient No: ${phone}\nDepartment: ${department}\nDate: ${date}\nTime Slot: ${timeSlot}\n\nView your Digital QR Pass here: ${ticketUrl}\n\nPlease arrive 15 minutes early. Thank you for using JanCare!`;

  console.log(`[Twilio Service] Prepping dispatch to ${phone}...`);

  if (client) {
    try {
      // Basic formatting to ensure Twilio accepts the India country code
      // Adjust if you are testing with a non-Indian number
      let formattedPhone = phone.replace(/\s+/g, '');
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+91' + formattedPhone; 
      }
      
      const message = await client.messages.create({
        body: messageBody,
        from: twilioNumber,
        to: formattedPhone
      });
      console.log(`[Twilio Service] SUCCESS! SMS sent! Message SID: ${message.sid}`);
    } catch (error) {
      console.error(`[Twilio Service] FATAL ERROR Sending SMS:`, error.message);
      console.log(`\n--- [FALLBACK MOCK MESSAGE] ---\n${messageBody}\n-------------------------------\n`);
    }
  } else {
    console.log(`[Twilio Mock] Credentials missing in .env. Faking dispatch: \n${messageBody}`);
  }

  return true;
};
