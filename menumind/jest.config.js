module.exports = {
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },
  testPathIgnorePatterns: ["/node_modules/", "/supabase/"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
};
