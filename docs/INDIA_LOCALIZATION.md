# India Localization Notes

## Demonstration identity

- Hospital: Aarogya Community Hospital
- Campus: Kothrud, Pune, Maharashtra
- Timezone: Asia/Kolkata
- Emergency number: 108
- Operating language: English, with interpreter-ready workflows

## Synthetic dataset

The seed dataset includes Indian names, mobile formats, PIN-coded addresses, and locally familiar insurance contexts. Every person, MRN, phone number, email address, clinical event, and encounter is synthetic and must not be treated as a real patient record.

Examples of the localization include:

- `+91` mobile numbers
- Cities and PIN codes across India
- Star Health, HDFC Ergo, Niva Bupa, ICICI Lombard, New India Assurance, Tata AIG, CGHS, ESIC, and Ayushman Bharat PM-JAY contexts
- Emergency number `108`
- Interpreter-ready appointment notes
- Indian clinician names and specialties

## Production considerations

For an Indian deployment, validate the following with the hospital and legal counsel:

- Consent notice and lawful-purpose documentation
- Digital Personal Data Protection Act, 2023 obligations
- ABDM/ABHA and EHR interoperability requirements where applicable
- Telemedicine and clinical registration requirements
- Emergency, ambulance, and escalation procedures
- Accessibility, language, and interpreter needs
- Retention, correction, export, and deletion workflows
- India-region hosting and backup requirements

The demo intentionally does not collect Aadhaar numbers.
