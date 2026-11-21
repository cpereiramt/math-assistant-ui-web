export default function CommunityPolicy() {
  return (
    <article className="mx-auto max-w-3xl space-y-5 px-4 py-8 text-slate-800">
      <h1 className="text-3xl font-semibold">Community policy</h1>
      <section>
        <h2 className="text-lg font-semibold">Spam and manipulation</h2>
        <p>Avoid duplicate submissions, unsolicited promotion, coordinated voting, and using multiple accounts to inflate engagement. Daily limits apply to publication requests, comments, ratings, and reports.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Abuse</h2>
        <p>Discuss the mathematics respectfully. Harassment, threats, discrimination, impersonation, and publishing someone else’s private information are prohibited.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Mathematical correctness</h2>
        <p>State the formula’s domain, units, assumptions, and parameter meanings where relevant. Give a counterexample or reference when reporting an error. Distinguish an incorrect result from a disagreement about notation or conventions.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Review and decisions</h2>
        <p>Use the report form on a formula or comment and select the reason. Moderators review the reported version and can dismiss the report or remove the content with a recorded explanation. The author receives an in-app notice when their content is removed. For a corrected formula, submit a fresh publication for review.</p>
      </section>
    </article>
  );
}
