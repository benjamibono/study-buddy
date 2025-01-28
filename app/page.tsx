"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { BookOpen, ChevronLeft, ChevronRight, RotateCw, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Image from 'next/image'; // Import the Image component

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
}

export default function Home() {
  const { toast } = useToast();
  const [studyText, setStudyText] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (questions.length > 0) {
      timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(timer);
  }, [questions]);

  const generateQuestions = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: studyText,
          difficulty,
          count: questionCount,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const data = await response.json();
      const formattedQuestions = data.questions.map((q: any, index: number) => ({
        ...q,
        id: index,
      }));

      setQuestions(formattedQuestions);
      setCurrentQuestion(0);
      setShowAnswer(false);
      setAnswers({});
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = (optionIndex: number) => {
    if (answers[currentQuestion] === undefined) {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion]: optionIndex,
      }));
    }
  };

  const getScore = () => {
    const correct = Object.entries(answers).filter(
      ([questionId, answer]) => questions[parseInt(questionId)].correctAnswer === answer
    ).length;
    const total = Object.keys(answers).length;
    if (total === questions.length) {
      return `${((correct / total) * 10).toFixed()} / 10`;
    }
    return `${correct}/${total}`;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleQuestionCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuestionCount(Math.min(30, Math.max(1, parseInt(value) || 1)));
  };

  const incrementQuestionCount = () => {
    setQuestionCount((prev) => Math.min(30, prev + 1));
  };

  const decrementQuestionCount = () => {
    setQuestionCount((prev) => Math.max(1, prev - 1));
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {questions.length === 0 ? (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center space-x-2">
            <Image src="/study.webp" alt="Custom Logo" className="w-12 h-12 rounded-full" width={48} height={48} />
            <h1 className="text-xl md:text-2xl font-bold">Study Buddy</h1>
            </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="study-text">Study Material or Subject</Label>
              <Textarea
                id="study-text"
                placeholder="Paste your study material or enter a subject here..."
                className="min-h-[150px] md:min-h-[200px]"
                value={studyText}
                onChange={(e) => setStudyText(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="question-count">Number of Questions (1-30)</Label>
                <div className="py-2 px-3 bg-white border border-gray-200 rounded-lg dark:bg-neutral-900 dark:border-neutral-700" data-hs-input-number="">
                  <div className="w-full flex justify-between items-center gap-x-5">
                    <div className="grow">
                      <span className="block text-xs text-gray-500 dark:text-neutral-400">
                        Select quantity
                      </span>
                      <input
                        className="w-full p-0 bg-transparent border-0 text-gray-800 focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none dark:text-white"
                        style={{ MozAppearance: "textfield" }}
                        type="number"
                        aria-roledescription="Number field"
                        value={questionCount}
                        onChange={handleQuestionCountChange}
                        data-hs-input-number-input=""
                      />
                    </div>
                    <div className="flex justify-end items-center gap-x-1.5">
                      <button
                        type="button"
                        className="size-6 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-full border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
                        tabIndex={-1}
                        aria-label="Decrease"
                        onClick={decrementQuestionCount}
                        data-hs-input-number-decrement=""
                      >
                        <svg className="shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14"></path>
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="size-6 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-full border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
                        tabIndex={-1}
                        aria-label="Increase"
                        onClick={incrementQuestionCount}
                        data-hs-input-number-increment=""
                      >
                        <svg className="shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14"></path>
                          <path d="M12 5v14"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={generateQuestions}
              disabled={!studyText.trim() || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                'Generate Questions'
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg md:text-xl font-semibold">
              Question {currentQuestion + 1} of {questions.length}
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Time: {formatTime(elapsedTime)}</span>
              <span className="text-sm font-medium">Score: {getScore()}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setQuestions([]);
                  setAnswers({});
                }}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Progress
            value={((currentQuestion + 1) / questions.length) * 100}
            className="w-full"
          />

          <Card className="p-4 md:p-6">
            <div
              className="min-h-[150px] md:min-h-[200px] cursor-pointer"
              onClick={() => setShowAnswer(!showAnswer)}
            >
              {!showAnswer ? (
                <div className="space-y-4">
                  <p className="text-base md:text-lg font-medium">{questions[currentQuestion].text}</p>
                  <div className="space-y-2">
                    {questions[currentQuestion].options.map((option, index) => (
                      <Button
                        key={index}
                        variant={answers[currentQuestion] === index ? 
                          (index === questions[currentQuestion].correctAnswer ? "correct" : "destructive") 
                          : "outline"}
                        className="w-full justify-start text-left"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAnswer(index);
                        }}
                        disabled={answers[currentQuestion] !== undefined}
                      >
                        {String.fromCharCode(65 + index)}. {option}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-base md:text-lg font-medium">
                    Correct Answer: {String.fromCharCode(65 + questions[currentQuestion].correctAnswer)}
                  </p>
                </div>
              )}
            </div>
          </Card>

          <div className="flex justify-between">
            <Button
              onClick={() => {
                setCurrentQuestion(currentQuestion - 1);
                setShowAnswer(false);
              }}
              disabled={currentQuestion === 0}
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <Button
              onClick={() => {
                setCurrentQuestion(currentQuestion + 1);
                setShowAnswer(false);
              }}
              disabled={currentQuestion === questions.length - 1}
            >
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}