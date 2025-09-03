
'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, documentId } from 'firebase/firestore';

export interface LeaderboardEntry {
    rank: number;
    studentName: string;
    score: number;
    totalQuestions: number;
    percentage: number;
    submittedAt: string;
}

export async function getLeaderboard(quizId: string): Promise<LeaderboardEntry[]> {
    try {
        const resultsQuery = query(
            collection(db, 'quizResults'),
            where('quizId', '==', quizId),
            orderBy('percentage', 'desc'),
            orderBy('submittedAt', 'asc')
        );

        const resultsSnapshot = await getDocs(resultsQuery);

        if (resultsSnapshot.empty) {
            return [];
        }

        const resultsData = resultsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const studentIds = [...new Set(resultsData.map(result => result.studentId))];
        
        if (studentIds.length === 0) {
            return [];
        }

        // Fetch student names
        const studentsQuery = query(collection(db, 'students'), where(documentId(), 'in', studentIds));
        const studentsSnapshot = await getDocs(studentsQuery);
        const studentNames: Record<string, string> = {};
        studentsSnapshot.forEach(doc => {
            studentNames[doc.id] = doc.data().name || 'Anonymous';
        });

        const leaderboard: LeaderboardEntry[] = resultsData.map((result, index) => ({
            rank: index + 1,
            studentName: studentNames[result.studentId] || 'Anonymous',
            score: result.score,
            totalQuestions: result.totalQuestions,
            percentage: result.percentage,
            submittedAt: result.submittedAt?.toDate().toLocaleString() || 'N/A',
        }));

        return leaderboard;

    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        throw new Error("Could not fetch leaderboard data.");
    }
}
