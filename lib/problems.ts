
export type ExampleTestCase = {
  input: string;
  output: string;
  explanation?: string;
};

export type Problem = {
  qid: string;
  number: number;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string[];
  examples: ExampleTestCase[];
  constraints: string[];
};

export const problems: Problem[] = [
  {
    qid: "1",
    number: 1,
    title: "Two Sum",
    difficulty: "Easy",
    description: [
      "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.",
      "You may assume that each input has exactly one solution, and you may not use the same element twice.",
      "You can return the answer in any order.",
    ],
    examples: [
      {
        input: "nums = [2, 7, 11, 15], target = 9",
        output: "[0, 1]",
        explanation:
          "nums[0] + nums[1] = 2 + 7 = 9.",
      },
      {
        input: "nums = [3, 2, 4], target = 6",
        output: "[1, 2]",
        explanation:
          "nums[1] + nums[2] = 2 + 4 = 6.",
      },
      {
        input: "nums = [3, 3], target = 6",
        output: "[0, 1]",
      },
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists.",
    ],
  },
  {
    qid: "2",
    number: 2,
    title: "Valid Palindrome",
    difficulty: "Easy",
    description: [
      "Given a string s, determine whether it is a palindrome, considering only alphanumeric characters and ignoring case.",
      "Return true if the resulting string reads the same forward and backward. Otherwise, return false.",
    ],
    examples: [
      {
        input: 's = "A man, a plan, a canal: Panama"',
        output: "true",
        explanation:
          '"amanaplanacanalpanama" is a palindrome.',
      },
      {
        input: 's = "race a car"',
        output: "false",
        explanation:
          '"raceacar" does not read the same backward.',
      },
      {
        input: 's = " "',
        output: "true",
        explanation:
          "After removing non-alphanumeric characters, the string is empty.",
      },
    ],
    constraints: [
      "1 <= s.length <= 2 * 10^5",
      "s consists of printable ASCII characters.",
    ],
  },
  {
    qid: "3",
    number: 3,
    title: "Maximum Subarray",
    difficulty: "Medium",
    description: [
      "Given an integer array nums, find the contiguous subarray with the largest sum and return that sum.",
      "A subarray is a non-empty sequence of consecutive elements from the original array.",
    ],
    examples: [
      {
        input: "nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]",
        output: "6",
        explanation:
          "The subarray [4, -1, 2, 1] has the largest sum: 6.",
      },
      {
        input: "nums = [1]",
        output: "1",
      },
      {
        input: "nums = [5, 4, -1, 7, 8]",
        output: "23",
      },
    ],
    constraints: [
      "1 <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4",
    ],
  },
];

export function getProblem(qid: string) {
  return problems.find((problem) => problem.qid === qid);
}
