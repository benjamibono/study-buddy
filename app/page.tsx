"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { BookOpen, ChevronLeft, ChevronRight, RotateCw, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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
  const [questionCount, setQuestionCount] = useState(5);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isGenerating, setIsGenerating] = useState(false);

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
    return `${correct}/${Object.keys(answers).length}`;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {questions.length === 0 ? (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6" />
            <h1 className="text-2xl font-bold">Interactive Study Tool</h1>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="study-text">Study Material</Label>
              <Textarea
                id="study-text"
                placeholder="Paste your study material here..."
                className="min-h-[200px]"
                value={studyText}
                onChange={(e) => setStudyText(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="question-count">Number of Questions (1-20)</Label>
                <Input
                  id="question-count"
                  type="number"
                  min="1"
                  max="20"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                />
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
            <h2 className="text-xl font-semibold">
              Question {currentQuestion + 1} of {questions.length}
            </h2>
            <div className="flex items-center space-x-2">
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

          <Card className="p-6">
            <div
              className="min-h-[200px] cursor-pointer"
              onClick={() => setShowAnswer(!showAnswer)}
            >
              {!showAnswer ? (
                <div className="space-y-4">
                  <p className="text-lg font-medium">{questions[currentQuestion].text}</p>
                  <div className="space-y-2">
                    {questions[currentQuestion].options.map((option, index) => (
                      <Button
                        key={index}
                        variant={answers[currentQuestion] === index ? 
                          (index === questions[currentQuestion].correctAnswer ? "default" : "destructive") 
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
                  <p className="text-lg font-medium">
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