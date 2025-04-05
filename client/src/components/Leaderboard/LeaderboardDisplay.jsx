import React from 'react';
import { useGameStore } from '../../store/gameStore';

function LeaderboardDisplay() {
    const leaderboardData = useGameStore((state) => state.leaderboardData);

    // Format timestamp for display (optional)
    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        try {
            return new Date(timestamp).toLocaleString();
        } catch (e) {
            return 'Invalid Date';
        }
    };


    return (
        <div className="leaderboard">
            <h3>Top Scores</h3>
            {leaderboardData.length === 0 ? (
                <p>No scores yet, or leaderboard is loading...</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Email</th>
                            <th>Score</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboardData.map((entry, index) => (
                            <tr key={entry.id || index}> {/* Use a unique key if available */}
                                <td>{index + 1}</td>
                                <td>{entry.player_email}</td>
                                <td>{entry.score}</td>
                                 <td>{formatDate(entry.created_at)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default LeaderboardDisplay;