// Responsibility: define the legal KYC status state machine (e.g. pending ->
// verified | rejected | under_review; under_review -> verified | rejected;
// verified/rejected are terminal) and export a check the approve/reject/
// escalate routes call before writing — reject the request if the
// transition isn't legal instead of silently overwriting status.
