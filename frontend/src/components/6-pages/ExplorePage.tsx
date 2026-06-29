import { useState } from 'react';
import { useThreads } from '../../hooks/useThreads';
import { useTopics } from '../../hooks/useTopics';

const ExplorePage = () => {
	const [selectedTopicId, setSelectedTopicId] = useState<string | undefined>();
	const { data: topics, isLoading: topicsLoading } = useTopics();
	const { data: threads, isLoading: threadsLoading } = useThreads(
		1,
		20,
		selectedTopicId,
	);

	return (
		<div className="flex flex-col gap-6">
			<h2 className="text-xl font-semibold text-white">Explore</h2>

			{/* Topics */}
			<div className="flex flex-col gap-2">
				<h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
					Topics
				</h3>
				{topicsLoading ? (
					<div className="flex gap-2 flex-wrap">
						{[1, 2, 3, 4].map((n) => (
							<div
								key={n}
								className="h-7 w-20 rounded-full bg-neutral-800 animate-pulse"
							/>
						))}
					</div>
				) : (
					<div className="flex gap-2 flex-wrap">
						<button
							type="button"
							onClick={() => setSelectedTopicId(undefined)}
							className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${!selectedTopicId ? 'bg-white text-neutral-950' : 'border border-neutral-700 text-neutral-300 hover:border-neutral-500'}`}
						>
							All
						</button>
						{topics?.map((topic) => (
							<button
								key={topic.id}
								type="button"
								onClick={() => setSelectedTopicId(topic.id)}
								className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedTopicId === topic.id ? 'bg-white text-neutral-950' : 'border border-neutral-700 text-neutral-300 hover:border-neutral-500'}`}
							>
								{topic.name}
							</button>
						))}
					</div>
				)}
			</div>

			{/* Threads */}
			<div className="flex flex-col gap-2">
				<h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
					Threads
				</h3>
				{threadsLoading ? (
					<div className="flex flex-col gap-3">
						{[1, 2, 3].map((n) => (
							<div
								key={n}
								className="border border-neutral-800 rounded-lg p-4 animate-pulse flex flex-col gap-2"
							>
								<div className="h-3 w-1/2 bg-neutral-800 rounded" />
								<div className="h-3 w-1/4 bg-neutral-800 rounded" />
							</div>
						))}
					</div>
				) : threads?.length === 0 ? (
					<p className="text-sm text-neutral-500 py-4 text-center">
						No threads yet.
					</p>
				) : (
					<div className="flex flex-col gap-3">
						{threads?.map((thread) => (
							<div
								key={thread.id}
								className="border border-neutral-800 rounded-lg p-4 flex flex-col gap-1 hover:border-neutral-700 transition-colors"
							>
								<div className="flex items-center gap-2">
									<span className="text-xs px-2 py-0.5 rounded-full border border-neutral-700 text-neutral-400">
										{thread.topic.name}
									</span>
									<span className="text-xs text-neutral-600">
										{thread._count.posts} posts
									</span>
								</div>
								<h4 className="text-sm font-medium text-white">
									{thread.title}
								</h4>
								<p className="text-xs text-neutral-500">
									by @
									{thread.originalPoster.username ??
										thread.originalPoster.displayName ??
										'unknown'}
								</p>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default ExplorePage;
