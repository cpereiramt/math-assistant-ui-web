import { useEffect, useState } from "react";
import {
  addFormulaComment,
  deleteFormulaComment,
  fetchFormulaCommentReplies,
  fetchFormulaComments,
  rateFormula,
  removeFormulaRating,
} from "../services/api";
import { useAuth } from "../hooks/useAuth";

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}

function flattenComments(comments, collapsedReplies, depth = 0, result = []) {
  comments.forEach((comment) => {
    result.push({ comment, depth });
    if (!collapsedReplies.has(comment.id)) {
      flattenComments(comment.replies || [], collapsedReplies, depth + 1, result);
    }
  });
  return result;
}

function CommentItem({
  comment,
  depth,
  currentUser,
  onReply,
  onDelete,
  replyState,
  onToggleReplies,
  isCollapsed,
}) {
  const visualDepth = Math.min(depth, 4);

  return (
    <div
      className={depth > 0 ? "border-l-2 border-slate-200 pl-4" : ""}
      style={{ marginLeft: `${visualDepth * 1.25}rem` }}
    >
      <article className="border border-slate-200 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-slate-500">{comment.userId}</p>
            <p className="mt-1 text-xs text-slate-400">{formatDate(comment.createdAt)}</p>
          </div>
          <button type="button" onClick={() => onReply(comment.id)} className="text-xs font-medium text-amber-700 hover:text-amber-900">
            Reply
          </button>
        </div>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{comment.content}</p>
        {(currentUser?.email === comment.userId || currentUser?.id === comment.userId) && (
          <button type="button" onClick={() => onDelete(comment.id)} className="mt-3 text-xs text-slate-400 hover:text-rose-700">
            Delete
          </button>
        )}
      </article>
      {comment.replyCount > 0 && (
        <button
          type="button"
          onClick={() => onToggleReplies(comment.id)}
          disabled={replyState?.loading}
          className="mt-2 text-xs font-medium text-amber-700 hover:text-amber-900 disabled:opacity-50"
        >
          {replyState?.loading
            ? "Loading replies..."
            : replyState?.loaded && replyState.page + 1 < replyState.totalPages
              ? "Load more replies"
              : replyState?.loaded
                ? isCollapsed ? "Show replies" : "Hide replies"
                : `View ${comment.replyCount} ${comment.replyCount === 1 ? "reply" : "replies"}`}
        </button>
      )}
    </div>
  );
}

export default function FormulaSocialPanel({ formula }) {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(formula);
  const [comments, setComments] = useState([]);
  const [replyStates, setReplyStates] = useState({});
  const [collapsedReplies, setCollapsedReplies] = useState(new Set());
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [loadingComments, setLoadingComments] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const result = await fetchFormulaComments(formula.id);
      setComments(result.content || []);
      setReplyStates({});
      setCollapsedReplies(new Set());
    } catch (error) {
      setMessage(error?.response?.data?.message || "Could not load comments.");
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    setMetrics(formula);
    loadComments();
    // The formula id is stable while this panel is mounted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formula.id]);

  const handleVote = async (value) => {
    setMessage("");
    try {
      setMetrics(await rateFormula(formula.id, value));
    } catch (error) {
      setMessage(error?.response?.data?.message || "Could not save your vote.");
    }
  };

  const handleRemoveVote = async () => {
    setMessage("");
    try {
      setMetrics(await removeFormulaRating(formula.id));
    } catch (error) {
      setMessage(error?.response?.data?.message || "Could not remove your vote.");
    }
  };

  const handleSubmitComment = async (event) => {
    event.preventDefault();
    if (!commentText.trim()) return;

    setSubmitting(true);
    setMessage("");
    try {
      await addFormulaComment(formula.id, {
        content: commentText.trim(),
        parentCommentId: replyTo,
      });
      setCommentText("");
      setReplyTo(null);
      await loadComments();
      setMetrics((current) => ({ ...current, commentCount: (current.commentCount || 0) + 1 }));
    } catch (error) {
      setMessage(error?.response?.data?.message || "Could not add your comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteFormulaComment(commentId);
      await loadComments();
      setMetrics((current) => ({ ...current, commentCount: Math.max((current.commentCount || 1) - 1, 0) }));
    } catch (error) {
      setMessage(error?.response?.data?.message || "Could not delete the comment.");
    }
  };

  const updateCommentReplies = (items, commentId, replies) => items.map((comment) => {
    if (comment.id === commentId) {
      return { ...comment, replies: [...(comment.replies || []), ...replies] };
    }
    return { ...comment, replies: updateCommentReplies(comment.replies || [], commentId, replies) };
  });

  const loadReplies = async (commentId, page = 0) => {
    setReplyStates((current) => ({
      ...current,
      [commentId]: { ...(current[commentId] || {}), loading: true },
    }));
    try {
      const result = await fetchFormulaCommentReplies(formula.id, commentId, { page, size: 20 });
      setComments((current) => updateCommentReplies(current, commentId, result.content || []));
      setReplyStates((current) => ({
        ...current,
        [commentId]: { loaded: true, loading: false, page, totalPages: result.totalPages || 0 },
      }));
      setCollapsedReplies((current) => {
        const next = new Set(current);
        next.delete(commentId);
        return next;
      });
    } catch (error) {
      setReplyStates((current) => ({
        ...current,
        [commentId]: { ...(current[commentId] || {}), loading: false },
      }));
      setMessage(error?.response?.data?.message || "Could not load replies.");
    }
  };

  const toggleReplies = (commentId) => {
    const state = replyStates[commentId];
    if (!state?.loaded) {
      loadReplies(commentId);
      return;
    }
    if (state.page + 1 < state.totalPages) {
      loadReplies(commentId, state.page + 1);
      return;
    }
    setCollapsedReplies((current) => {
      const next = new Set(current);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  };

  return (
    <section className="mt-8 border-t border-slate-200 pt-8" aria-labelledby="social-heading">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Community signal</p>
          <h2 id="social-heading" className="mt-2 text-2xl font-semibold text-slate-950">Rate this formula</h2>
        </div>
        <div className="text-sm text-slate-600">
          <strong className="text-slate-950">{Number(metrics.averageRating || 0).toFixed(2)}</strong> rating · {metrics.ratingCount || 0} votes
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => handleVote(1)} className="border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-100">
          Helpful · {metrics.upvotes || 0}
        </button>
        <button type="button" onClick={() => handleVote(-1)} className="border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-800 hover:bg-rose-100">
          Not useful · {metrics.downvotes || 0}
        </button>
        <button type="button" onClick={handleRemoveVote} className="px-3 py-2 text-sm text-slate-500 hover:text-slate-900">
          Remove my vote
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-950">Discussion</h3>
            <span className="text-sm text-slate-500">{metrics.commentCount || 0} comments</span>
          </div>
          {loadingComments ? (
            <p className="mt-4 text-sm text-slate-500">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="mt-4 border border-dashed border-slate-300 p-5 text-sm text-slate-500">No comments yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {flattenComments(comments, collapsedReplies).map(({ comment, depth }) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  depth={depth}
                  currentUser={user}
                  onReply={setReplyTo}
                  onDelete={handleDeleteComment}
                  replyState={replyStates[comment.id]}
                  onToggleReplies={toggleReplies}
                  isCollapsed={collapsedReplies.has(comment.id)}
                />
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmitComment} className="h-fit border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="formula-comment" className="text-sm font-semibold text-slate-950">Add a comment</label>
            {replyTo && <button type="button" onClick={() => setReplyTo(null)} className="text-xs text-slate-500 hover:text-slate-900">Cancel reply</button>}
          </div>
          <textarea
            id="formula-comment"
            value={commentText}
            maxLength={2000}
            onChange={(event) => setCommentText(event.target.value)}
            placeholder={replyTo ? "Write a reply..." : "Share an observation or question..."}
            className="mt-3 min-h-32 w-full resize-y border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-400">{commentText.length}/2000</span>
            <button type="submit" disabled={submitting || !commentText.trim()} className="bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-40">
              {submitting ? "Posting..." : "Post comment"}
            </button>
          </div>
        </form>
      </div>
      {message && <p role="alert" className="mt-4 text-sm text-rose-700">{message}</p>}
    </section>
  );
}