'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Dumbbell, Target, X } from 'lucide-react';
import { useState } from 'react';

export default function AddExerciseModal({ isOpen, onClose, onSave }) {
  const [exerciseName, setExerciseName] = useState('');
  const [targetReps, setTargetReps] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name: exerciseName,
      targetReps: parseInt(targetReps, 10)
    });
    setExerciseName('');
    setTargetReps('');
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-70"
          leave="ease-in duration-200"
          leaveFrom="opacity-70"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-sm rounded-2xl bg-zinc-900/95 backdrop-blur-sm p-6 shadow-xl transform transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-xl font-semibold text-white">
                    Add New Exercise
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Exercise Name */}
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-400">
                      Exercise Name
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Dumbbell className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        value={exerciseName}
                        onChange={(e) => setExerciseName(e.target.value)}
                        placeholder="e.g., Squats, Push-ups"
                        className="w-full bg-zinc-800/90 text-white rounded-lg py-2 pl-10 pr-3 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
                        required
                      />
                    </div>
                  </div>

                  {/* Initial Daily Target Reps */}
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-400">
                      Initial Daily Target Reps
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Target className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        value={targetReps}
                        onChange={(e) => setTargetReps(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g., 10, 25, 50"
                        className="w-full bg-zinc-800/90 text-white rounded-lg py-2 pl-10 pr-3 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      This is your starting goal. You can adjust it later as you progress.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-2 text-gray-400 hover:text-white transition-colors rounded-lg bg-zinc-800/80 hover:bg-zinc-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 