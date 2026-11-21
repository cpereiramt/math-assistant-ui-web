import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CommunityPagination from "../components/CommunityPagination";
import FormulaCardItem from "../components/FormulaCardItem";
import { useAuth } from "../hooks/useAuth";
import { fetchAuthor, fetchAuthorFormulas, saveAuthor, setFollowing } from "../services/community";

const input = "rounded border border-slate-300 bg-white p-2";
const button = "rounded bg-blue-700 px-4 py-2 font-medium text-white disabled:opacity-50";

export default function PublicAuthor({ own = false }) {
  const { id } = useParams();
  return <AuthorProfile key={own ? "me" : id} id={own ? "me" : id} />;
}

function AuthorProfile({ id }) {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [draft, setDraft] = useState(null);
  const [publications, setPublications] = useState(null);
  const [page, setPage] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [publicationError, setPublicationError] = useState(false);

  useEffect(() => {
    const request = new AbortController();
    fetchAuthor(id, request.signal)
      .then(setProfile)
      .catch(() => {
        if (!request.signal.aborted) setError("Could not load this profile.");
      });
    return () => request.abort();
  }, [id]);

  const authorId = profile?.id;
  useEffect(() => {
    if (!authorId) return;
    const request = new AbortController();
    fetchAuthorFormulas(authorId, page, request.signal)
      .then(setPublications)
      .catch(() => {
        if (!request.signal.aborted) setPublicationError(true);
      });
    return () => request.abort();
  }, [authorId, page]);

  async function changeFollowing() {
    const enabled = !profile.following;
    setError("");
    setBusy(true);
    try {
      await setFollowing(profile.id, enabled);
      setProfile(await fetchAuthor(profile.id));
    } catch {
      setError("Could not update the follow status.");
    } finally {
      setBusy(false);
    }
  }

  async function save(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      setProfile(await saveAuthor(draft));
      setDraft(null);
    } catch {
      setError("Could not save the profile. Check the name and website.");
    } finally {
      setBusy(false);
    }
  }

  if (!profile) return <p className="p-8" role={error ? "alert" : undefined}>{error || "Loading author…"}</p>;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      {id !== "me" && <Link to="/" className="text-sm text-blue-700 underline">Math Assistant</Link>}
      <header className="my-4 flex flex-wrap items-start gap-4 rounded border border-slate-200 bg-white p-5">
        {profile.avatarUrl && <img src={profile.avatarUrl} alt="" referrerPolicy="no-referrer" className="h-16 w-16 rounded-full object-cover" />}
        <div className="min-w-0 flex-1">
          <h1 className="break-words text-3xl font-semibold">{profile.name}</h1>
          <p className="mt-1 text-sm text-slate-600">{profile.followers} {profile.followers === 1 ? "follower" : "followers"}</p>
          {profile.bio && <p className="mt-3 whitespace-pre-wrap break-words">{profile.bio}</p>}
          {profile.website && <a href={profile.website} rel="ugc nofollow" className="mt-2 inline-block break-all text-blue-700 underline">{profile.website}</a>}
        </div>
        {profile.own && !draft && <button type="button" className={button}
          onClick={() => setDraft({ name: profile.name || "", bio: profile.bio || "", website: profile.website || "" })}>Edit profile</button>}
        {!profile.own && token && <button type="button" disabled={busy} className={button} onClick={changeFollowing}>
          {profile.following ? "Unfollow" : "Follow"}
        </button>}
        {id === "me" && <Link to={`/authors/${profile.id}`} className="text-sm text-blue-700 underline">Public profile</Link>}
      </header>
      {error && <p role="alert" className="my-4 text-red-700">{error}</p>}
      {draft && <form onSubmit={save} className="my-5 grid max-w-lg gap-3">
        <label className="grid gap-1">Display name<input required maxLength={80} className={input} value={draft.name}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
        <label className="grid gap-1">Bio<textarea maxLength={500} className={input} value={draft.bio}
          onChange={(event) => setDraft({ ...draft, bio: event.target.value })} /></label>
        <label className="grid gap-1">Website<input type="url" maxLength={300} className={input} value={draft.website}
          onChange={(event) => setDraft({ ...draft, website: event.target.value })} /></label>
        <div className="flex gap-3"><button disabled={busy} className={button}>Save</button>
          <button type="button" onClick={() => setDraft(null)} disabled={busy}>Cancel</button></div>
      </form>}
      <h2 className="mt-8 text-xl font-semibold">Published formulas</h2>
      {publicationError && <p role="alert" className="mt-3">Could not load the publications.</p>}
      {!publications && !publicationError && <p className="mt-3">Loading publications…</p>}
      {publications?.totalElements === 0 && <p className="mt-3">No public formulas yet.</p>}
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {publications?.content.map((formula) => <FormulaCardItem key={formula.id} formula={formula} />)}
      </div>
      {publications && <CommunityPagination page={page} totalPages={publications.totalPages} onChange={setPage} />}
    </section>
  );
}
