
import React, { useState } from 'react';
import { DSAProblem } from '../types';
import { explainCodeLogic, debugCode } from '../services/aiService';

const PROBLEMS: DSAProblem[] = [
  {
    id: '1',
    title: 'Reverse a Linked List',
    difficulty: 'Easy',
    category: 'Linked List',
    description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    template: '/**\n * Definition for singly-linked list.\n * function ListNode(val, next) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.next = (next===undefined ? null : next)\n * }\n */\n/**\n * @param {ListNode} head\n * @return {ListNode}\n */\nvar reverseList = function(head) {\n    \n};'
  },
  {
    id: '2',
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Arrays',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    template: '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    \n};'
  },
  {
    id: '3',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    category: 'Stacks',
    description: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
    template: '/**\n * @param {string} s\n * @return {boolean}\n */\nvar isValid = function(s) {\n    \n};'
  },
  {
    id: '4',
    title: 'Longest Palindromic Substring',
    difficulty: 'Medium',
    category: 'String / DP',
    description: 'Given a string s, return the longest palindromic substring in s.',
    template: '/**\n * @param {string} s\n * @return {string}\n */\nvar longestPalindrome = function(s) {\n    \n};'
  },
  {
    id: '5',
    title: 'Maximum Depth of Binary Tree',
    difficulty: 'Easy',
    category: 'Trees',
    description: 'Given the root of a binary tree, return its maximum depth. A binary tree\'s maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.',
    template: '/**\n * Definition for a binary tree node.\n * function TreeNode(val, left, right) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.left = (left===undefined ? null : left)\n *     this.right = (right===undefined ? null : right)\n * }\n */\n/**\n * @param {TreeNode} root\n * @return {number}\n */\nvar maxDepth = function(root) {\n    \n};'
  },
  {
    id: '6',
    title: 'Number of Islands',
    difficulty: 'Medium',
    category: 'Graphs / BFS',
    description: 'Given an m x n 2D binary grid which represents a map of \'1\'s (land) and \'0\'s (water), return the number of islands.',
    template: '/**\n * @param {character[][]} grid\n * @return {number}\n */\nvar numIslands = function(grid) {\n    \n};'
  },
  {
    id: '7',
    title: 'Coin Change',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    description: 'You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins that you need to make up that amount.',
    template: '/**\n * @param {number[]} coins\n * @param {number} amount\n * @return {number}\n */\nvar coinChange = function(coins, amount) {\n    \n};'
  },
  {
    id: '8',
    title: 'Median of Two Sorted Arrays',
    difficulty: 'Hard',
    category: 'Arrays / Binary Search',
    description: 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).',
    template: '/**\n * @param {number[]} nums1\n * @param {number[]} nums2\n * @return {number}\n */\nvar findMedianSortedArrays = function(nums1, nums2) {\n    \n};'
  },
  {
    id: '9',
    title: 'Binary Tree Level Order Traversal',
    difficulty: 'Medium',
    category: 'Trees / BFS',
    description: 'Given the root of a binary tree, return the level order traversal of its nodes\' values. (i.e., from left to right, level by level).',
    template: '/**\n * Definition for a binary tree node.\n * function TreeNode(val, left, right) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.left = (left===undefined ? null : left)\n *     this.right = (right===undefined ? null : right)\n * }\n */\n/**\n * @param {TreeNode} root\n * @return {number[][]}\n */\nvar levelOrder = function(root) {\n    \n};'
  }
];

export const CodeHub: React.FC = () => {
  const [selectedProblem, setSelectedProblem] = useState<DSAProblem>(PROBLEMS[0]);
  const [code, setCode] = useState(selectedProblem.template);
  const [isLoading, setIsLoading] = useState(false);
  const [terminalMode, setTerminalMode] = useState<'explain' | 'debug'>('explain');
  const [aiOutput, setAiOutput] = useState<{ explain: string; debug: string }>({ explain: '', debug: '' });

  const handleProblemSelect = (prob: DSAProblem) => {
    setSelectedProblem(prob);
    setCode(prob.template);
    setAiOutput({ explain: '', debug: '' });
  };

  const handleExplain = async () => {
    setTerminalMode('explain');
    setIsLoading(true);
    try {
      const explanation = await explainCodeLogic(selectedProblem.title, code);
      setAiOutput(prev => ({ ...prev, explain: explanation || 'AI failed to process the logic.' }));
    } catch (e) {
      setAiOutput(prev => ({ ...prev, explain: 'Error connecting to Neural AI Explainer.' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDebug = async () => {
    setTerminalMode('debug');
    setIsLoading(true);
    try {
      const debugReport = await debugCode(selectedProblem.title, selectedProblem.description, code);
      setAiOutput(prev => ({ ...prev, debug: debugReport || 'AI failed to analyze errors.' }));
    } catch (e) {
      setAiOutput(prev => ({ ...prev, debug: 'Error connecting to Neural Debugger.' }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full animate-in fade-in slide-in-from-bottom-10 duration-700">
      {/* Problem List */}
      <div className="lg:col-span-1 space-y-6">
        <div className="glass-card p-6 rounded-[2.5rem] border-white/5 h-[700px] flex flex-col">
          <h3 className="text-xl font-black text-white mb-8 tracking-tighter uppercase px-2">Problem Set</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {PROBLEMS.map((prob) => (
              <button
                key={prob.id}
                onClick={() => handleProblemSelect(prob)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedProblem.id === prob.id
                    ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-600/20'
                    : 'bg-white/5 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                    {prob.category}
                  </p>
                  <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded ${
                    prob.difficulty === 'Easy' ? 'text-emerald-400 bg-emerald-400/10' :
                    prob.difficulty === 'Medium' ? 'text-amber-400 bg-amber-400/10' :
                    'text-rose-400 bg-rose-400/10'
                  }`}>
                    {prob.difficulty}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mb-2 leading-tight">
                  {prob.title}
                </h4>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Workspace */}
      <div className="lg:col-span-3 space-y-8 h-full flex flex-col">
        <div className="glass-card p-8 rounded-[3.5rem] border-white/10 flex-1 flex flex-col shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
             <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
            <div>
              <span className="mono text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] block mb-2">NEURAL WORKSPACE v1.1</span>
              <div className="flex items-center gap-3">
                <h3 className="text-3xl font-black text-white tracking-tighter leading-none">{selectedProblem.title}</h3>
                <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${
                  selectedProblem.difficulty === 'Easy' ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-500/20' :
                  selectedProblem.difficulty === 'Medium' ? 'text-amber-400 bg-amber-400/10 border border-amber-500/20' :
                  'text-rose-400 bg-rose-400/10 border border-rose-500/20'
                }`}>
                  {selectedProblem.difficulty}
                </span>
              </div>
            </div>
            <div className="flex gap-4">
               <button 
                onClick={handleExplain}
                disabled={isLoading}
                className={`border px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${terminalMode === 'explain' && aiOutput.explain ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 Logic Explainer
               </button>
               <button 
                onClick={handleDebug}
                disabled={isLoading}
                className={`border px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${terminalMode === 'debug' && aiOutput.debug ? 'bg-rose-600/20 border-rose-500 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                 Neural Debugger
               </button>
               <button className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all">
                 Run Code
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
             <div className="flex flex-col">
                <div className="bg-slate-950/60 border border-white/5 rounded-[2rem] p-6 text-slate-400 text-sm font-medium leading-relaxed h-[200px] overflow-y-auto mb-6 shadow-inner custom-scrollbar">
                   <div className="flex items-center gap-2 mb-2 text-indigo-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      <span className="mono text-[10px] font-black uppercase tracking-widest">Problem Specification</span>
                   </div>
                   {selectedProblem.description}
                </div>
                <div className="flex-1 bg-[#050b1a] border border-white/10 rounded-[2.5rem] relative shadow-2xl group overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-full p-6 font-mono text-sm leading-relaxed pointer-events-none flex opacity-20">
                      <div className="w-8 border-r border-white/5 mr-4 text-right pr-2 select-none text-slate-700">
                        {Array.from({length: 40}).map((_, i) => <div key={i}>{i+1}</div>)}
                      </div>
                   </div>
                   <textarea
                    className="w-full h-full bg-transparent p-10 font-mono text-sm leading-relaxed text-indigo-100 focus:outline-none resize-none z-10 relative custom-scrollbar"
                    spellCheck={false}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                   />
                </div>
             </div>

             <div className="flex flex-col">
                <div className="flex-1 bg-slate-900/40 border border-white/5 rounded-[3rem] p-8 overflow-y-auto relative custom-scrollbar">
                   <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${isLoading ? 'bg-amber-500' : (terminalMode === 'debug' ? 'bg-rose-500' : 'bg-indigo-500')}`}></div>
                        <span className="mono text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          {isLoading ? 'Neural Processing...' : (terminalMode === 'debug' ? 'Neural Debug Report' : 'AI Logic Terminal')}
                        </span>
                      </div>
                      {isLoading && (
                        <svg className="animate-spin h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      )}
                   </div>

                   <div className="space-y-6 animate-in fade-in duration-500">
                     {terminalMode === 'explain' ? (
                       aiOutput.explain ? (
                         <div className="prose prose-invert max-w-none">
                            <p className="text-slate-300 text-sm leading-relaxed font-medium whitespace-pre-wrap">
                              {aiOutput.explain}
                            </p>
                            <div className="mt-8 p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                               <p className="text-indigo-400 font-black text-[10px] uppercase tracking-widest mb-2">Complexity Engine</p>
                               <p className="text-slate-500 text-xs font-mono">Neural patterns suggest standard algorithmic complexity. Switch to Debugger for implementation verification.</p>
                            </div>
                         </div>
                       ) : (
                         <div className="h-full py-20 flex flex-col items-center justify-center text-center px-6 opacity-30">
                            <svg className="w-12 h-12 text-slate-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <p className="text-slate-700 text-xs font-black uppercase tracking-widest">Awaiting Command</p>
                         </div>
                       )
                     ) : (
                       aiOutput.debug ? (
                        <div className="prose prose-invert max-w-none">
                            <p className="text-slate-300 text-sm leading-relaxed font-medium whitespace-pre-wrap">
                              {aiOutput.debug}
                            </p>
                        </div>
                       ) : (
                        <div className="h-full py-20 flex flex-col items-center justify-center text-center px-6 opacity-30">
                            <svg className="w-12 h-12 text-slate-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                            <p className="text-slate-700 text-xs font-black uppercase tracking-widest">Awaiting Debug Scan</p>
                         </div>
                       )
                     )}
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
