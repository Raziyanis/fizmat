const GAME = {
  mode: "pairs", key: "topic-l7-kz",
  answers: ["ЖИЫН", "SET", "ЖИЫН SET", "МНОЖЕСТВО"],
  /* тақырып плиткалары: табылған әр жұп (тапсырма ретімен) біреуін ашады */
  tiles: ["Ж", "И", "Ы", "Н", "S", "E", "T"],
  tasks: [
    { n: 1, code: "d = {\"a\": 5, \"b\": 7}\nprint(d[\"b\"])", ans: "7" },
    { n: 2, code: "a = [4, 8, 6]\nprint(a[-1])", ans: "6" },
    { n: 3, code: "t = (3, 9, 4)\nprint(t.index(9))", ans: "1" },
    { n: 4, code: "d = {\"x\": 1}\nprint(d.get(\"y\", 0))", ans: "0" },
    { n: 5, code: "print(max([2, 11, 5]))", ans: "11" },
    { n: 6, code: "a = [5, 1, 4]\na.sort()\nprint(a)", ans: "[1, 4, 5]" },
    { n: 7, code: "d = {\"x\": 1}\nprint(\"x\" in d)", ans: "True" }
  ]
};
