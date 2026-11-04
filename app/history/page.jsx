'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import FeedbackModal from '@/components/FeedbackModal';
import { PLATFORM_INFO } from '@/components/SocialIcons';
import { 
  Trash2, 
  Image as ImageIcon, 
  Video, 
  Clock, 
  CheckCircle2, 
  PlusCircle,
  Search,
  Calendar,
  Filter,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { fetchPosts, deletePost, fetchCurrentUser } from '@/lib/api';

export default function HistoryPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [filterType, setFilterType] = useState('all'); // all, pending, published, scheduled, image, video
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal states for delete confirmation and feedback
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, postId: null });
  const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });

  // Admin permission flag
  const isAdmin = Boolean(currentUser?.isAdmin || currentUser?.role?.toLowerCase().includes('admin'));

  useEffect(() => {
    fetchCurrentUser()
      .then(user => {
        if (user) setCurrentUser(user);
      })
      .catch(() => {});
  }, []);

  const loadPostsData = async (showSkeleton = true) => {
    try {
      if (showSkeleton) setIsLoading(true);
      else setIsRefreshing(true);
      const pList = await fetchPosts();
      setPosts(pList || []);
    } catch (err) {
      console.error('Failed to load history data:', err);
    } finally {
      if (showSkeleton) setIsLoading(false);
      else setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadPostsData(true);
  }, []);

  // Auto-sync interval whenever any post is 'pending' (waiting for n8n callback)
  // Ensures UI auto-updates to 'Published' even if n8n takes 10-20 minutes
  useEffect(() => {
    const hasPending = posts.some(p => p.status === 'pending');
    if (!hasPending) return;

    const interval = setInterval(async () => {
      try {
        const latest = await fetchPosts();
        if (Array.isArray(latest)) {
          setPosts(latest);
        }
      } catch (e) {
        console.error('Silent background sync error:', e);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [posts]);

  const confirmDeletePost = async () => {
    if (!isAdmin) {
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Action Restricted',
        message: 'Only administrators have permission to delete campaign posts.'
      });
      return;
    }

    const id = deleteModal.postId;
    setDeleteModal({ isOpen: false, postId: null });
    if (!id) return;

    // Instantly remove from local UI list
    setPosts(prev => prev.filter(p => p.id !== id));

    try {
      const res = await deletePost(id);
      if (res && res.error) {
        throw new Error(res.error);
      }
      setFeedbackModal({
        isOpen: true,
        type: 'success',
        title: 'Post Deleted',
        message: 'The campaign post has been removed successfully from your history.'
      });
      loadPostsData();
    } catch (err) {
      console.error(err);
      loadPostsData(); // Restore if deletion failed on server
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Delete Failed',
        message: 'Could not delete the post. Please try again.'
      });
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingCount = posts.filter(p => p.status === 'pending').length;

  const filteredPosts = posts.filter((post) => {
    if (filterType === 'image' && post.type !== 'image') return false;
    if (filterType === 'video' && post.type !== 'video') return false;
    if (filterType === 'pending' && post.status !== 'pending') return false;
    if (filterType === 'scheduled' && post.status !== 'scheduled') return false;
    if (filterType === 'published' && post.status !== 'published') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCaption = post.caption?.toLowerCase().includes(q);
      const matchAuthor = post.postedBy?.name?.toLowerCase().includes(q);
      return matchCaption || matchAuthor;
    }
    return true;
  });

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Campaign History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track published posts and upcoming scheduled promotional campaigns.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Post</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        {/* Filter Pills */}
        <div className="inline-flex items-center p-1 bg-slate-200/80 rounded-xl overflow-x-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap font-semibold cursor-pointer ${
              filterType === 'all'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Posts ({posts.length})
          </button>
          <button
            onClick={() => setFilterType('pending')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap font-semibold cursor-pointer flex items-center space-x-1.5 ${
              filterType === 'pending'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {pendingCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
            <span>Pending {pendingCount > 0 ? `(${pendingCount})` : ''}</span>
          </button>
          <button
            onClick={() => setFilterType('published')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap font-semibold cursor-pointer ${
              filterType === 'published'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Published
          </button>
          <button
            onClick={() => setFilterType('scheduled')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap font-semibold cursor-pointer ${
              filterType === 'scheduled'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Scheduled
          </button>
          <button
            onClick={() => setFilterType('image')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap font-semibold cursor-pointer ${
              filterType === 'image'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Images
          </button>
          <button
            onClick={() => setFilterType('video')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap font-semibold cursor-pointer ${
              filterType === 'video'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Videos
          </button>
        </div>

        {/* Search Input and Refresh Button */}
        <div className="flex items-center space-x-2">
          <div className="relative min-w-[220px] sm:min-w-[260px] flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by caption or author..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-2xs"
            />
          </div>
          <button
            type="button"
            onClick={() => loadPostsData(false)}
            disabled={isRefreshing}
            title="Refresh campaign list"
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-2xs cursor-pointer flex-shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* History Table Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          /* Shimmering Skeleton Loader - NO mock data */
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-3 rounded-xl bg-slate-50/70 border border-slate-100 animate-pulse">
                <div className="w-16 h-16 bg-slate-200 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200/80 rounded w-1/3" />
                  <div className="flex items-center space-x-2 pt-1">
                    <div className="w-16 h-4 bg-slate-200 rounded-full" />
                    <div className="w-20 h-4 bg-slate-200 rounded-full" />
                  </div>
                </div>
                <div className="w-24 h-6 bg-slate-200 rounded-lg flex-shrink-0 hidden sm:block" />
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <p className="text-xs font-semibold text-slate-600">No campaigns found.</p>
            <p className="text-xs text-slate-400">Try changing your filters or create a new campaign.</p>
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold pt-1 cursor-pointer"
            >
              <span>Go to Post Creator</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredPosts.map((post) => {
              const isPending = post.status === 'pending';
              const isScheduled = post.status === 'scheduled';
              const isFailed = post.status === 'failed';
              const postImage = (post.mediaUrls && post.mediaUrls[0]) || post.mediaUrl;

              return (
                <div
                  key={post.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start space-x-4 overflow-hidden">
                    {/* Media Thumbnail */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200 flex items-center justify-center relative shadow-xs">
                      {post.type === 'video' ? (
                        postImage ? (
                          <video src={postImage} className="w-full h-full object-cover" />
                        ) : (
                          <Video className="w-6 h-6 text-slate-400" />
                        )
                      ) : postImage ? (
                        <img
                          src={postImage}
                          alt="Post media"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-slate-400" />
                      )}

                      {post.type === 'image' && post.mediaUrls && post.mediaUrls.length > 1 && (
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-bold">
                          +{post.mediaUrls.length}
                        </span>
                      )}
                    </div>

                    {/* Post Info */}
                    <div className="space-y-1.5 overflow-hidden">
                      <div className="flex items-center space-x-2 flex-wrap">
                        {isPending ? (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
                            <span>Pending (n8n Processing)</span>
                          </span>
                        ) : isScheduled ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <Clock className="w-3 h-3" />
                            <span>Scheduled</span>
                          </span>
                        ) : isFailed ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertCircle className="w-3 h-3" />
                            <span>Failed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                            <span>Published</span>
                          </span>
                        )}

                        <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {isPending
                              ? `Dispatched • ${formatDate(post.createdAt)}`
                              : isScheduled
                              ? `For ${formatDate(post.scheduledAt)}`
                              : `On ${formatDate(post.publishedAt || post.createdAt)}`}
                          </span>
                        </span>

                        {post.postedBy?.name && (
                          <span className="text-[11px] text-slate-500 font-medium hidden md:inline">
                            • by {post.postedBy.name}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-800 line-clamp-2 leading-relaxed">
                        {post.caption || 'No caption provided.'}
                      </p>

                      {/* Platforms Badge Row */}
                      <div className="flex items-center space-x-1.5 flex-wrap pt-0.5">
                        {post.platforms && post.platforms.map((platId) => {
                          const info = PLATFORM_INFO[platId];
                          if (!info) return null;
                          const Icon = info.icon;
                          return (
                            <span
                              key={platId}
                              className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium"
                              title={info.name}
                            >
                              <Icon className="w-3 h-3" />
                              <span>{info.name}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Actions - Only visible to Admins */}
                  {isAdmin && (
                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => setDeleteModal({ isOpen: true, postId: post.id })}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100 cursor-pointer"
                        title="Delete post (Admin Only)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirm Delete Modal */}
      <FeedbackModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, postId: null })}
        type="confirm_delete"
        title="Delete Campaign Post?"
        message="Are you sure you want to delete this campaign? It will be permanently removed from your post history."
        confirmText="Yes, Delete Post"
        cancelText="Cancel"
        onConfirm={confirmDeletePost}
      />

      {/* Generic Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackModal.isOpen}
        onClose={() => setFeedbackModal(prev => ({ ...prev, isOpen: false }))}
        type={feedbackModal.type}
        title={feedbackModal.title}
        message={feedbackModal.message}
        confirmText="OK"
      />
    </div>
  );
}
