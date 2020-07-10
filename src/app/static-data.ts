export class StaticData {

  public static readonly BUG_WITH_ATTACHMENTS = 45649;
  public static readonly COMMENT_WITH_USER_DATA = 172072;
  public static readonly BUGZILLA_LINK = "https://bugzilla.onlyoffice.com";

  public static readonly PRODUCTS =
  {"Office Canvas Document Editor": { name: "Documents", color: "#cbcbff", active: false, realName: "Office Canvas Document Editor" },
  "Office Canvas Spreadsheet Editor": { name: "Spreadsheets", color: "#c5ffc5", active: false, realName: "Office Canvas Spreadsheet Editor" },
  "Office Canvas Presentation Editor": { name: "Presentations", color: "#ffa7a7", active: false, realName: "Office Canvas Presentation Editor" },
  "Chromium Desktop Editors": { name: "Desktop", color: "#c49000", active: false, realName: "Chromium Desktop Editors" },
  "documenteditors plugins": { name: "Plugins", color: "#ff8ee2", active: false, realName: "documenteditors plugins" },
  "DocumentBuilder": { name: "Builder", color: "#feffba", active: false, realName: "DocumentBuilder" },
  "Documents iOS App": { name: "iOS", color: "#849fff", active: false, realName: "Documents iOS App" },
  "ONLYOFFICE Projects App iOS": { name: "iOS Projects", color: "#00dedd", active: false, realName: "ONLYOFFICE Projects App iOS" },
  "Documents Android App": { name: "Android", color: "#00c93e", active: false, realName: "Documents Android App" },
  "OnlyOffice": { name: "OnlyOffice", color: "#ffc800", active: false, realName: "OnlyOffice" },
  "OnlyOffice Install": { name: "O. Install", color: "#ff6e6e", active: false, realName: "OnlyOffice Install" }};

  public static readonly SEVERITIES =
  {"critical": { name: "Critical/Blocker", realName: "critical", addition: ["blocker"], color: "#ff0000" },
  "major": { name: "Major", realName: "major", color: "#ff8922" },
  "normal": { name: "Normal", realName: "normal", color: "#000000" },
  "minor": { name: "Minor/Trivial", realName: "minor", addition: ["trivial"], color: "#8d8d8d" },
  "enhancement": { name: "Enhancement", realName: "enhancement", isFeature: true, color: "#30ac09" }};

  public static readonly STATUSES =
  {"NEW": { name: "New/Assigned", realName: "NEW", addition: ["ASSIGNED"], active: false },
  "FIXED": { name: "Fixed", realName: "FIXED", active: false },
  "VERIFIED": { name: "Verified", realName: "VERIFIED", active: false },
  "REOPENED": { name: "Reopened", realName: "REOPENED", active: false }};

  public static readonly PRIORITIES =
  {"P1": { name: "P1", realName: "P1" },
  "P2": { name: "P2", realName: "P2" },
  "P3": { name: "P3", realName: "P3" },
  "P4": { name: "P4", realName: "P4" },
  "P5": { name: "P5", realName: "P5" }};
}

