export class StaticData {

  public static readonly BUG_WITH_ATTACHMENTS = 45649;
  public static readonly COMMENT_WITH_USER_DATA = 172072;
  public static readonly BUGZILLA_LINK = 'https://bugzilla.onlyoffice.com';

  public static readonly PRODUCTS =
  {'Office Canvas Document Editor': {id: 1, name: 'Documents', color: '#cbcbff', active: false, realName: 'Office Canvas Document Editor' },
  'Office Canvas Spreadsheet Editor':
   {id: 2, name: 'Spreadsheets', color: '#c5ffc5', active: false, realName: 'Office Canvas Spreadsheet Editor' },
  'Office Canvas Presentation Editor': { id: 4, name: 'Presentations', color: '#ffa7a7', active: false, realName: 'Office Canvas Presentation Editor' },
  'Chromium Desktop Editors': { id: 5, name: 'Desktop', color: '#ff8b15', active: false, realName: 'Chromium Desktop Editors' },
  'R7 Office': { id: 6, name: 'R7', color: '#c49000', active: false, realName: 'R7 Office' },
  'documenteditors plugins': { id: 7, name: 'Plugins', color: '#ff8ee2', active: false, realName: 'documenteditors plugins' },
  DocumentBuilder: { id: 8, name: 'Builder', color: '#feffba', active: false, realName: 'DocumentBuilder' },
  'Documents iOS App': { id: 9, name: 'iOS', color: '#849fff', active: false, realName: 'Documents iOS App' },
  'ONLYOFFICE Projects App iOS': { id: 10, name: 'iOS Projects', color: '#00dedd', active: false, realName: 'ONLYOFFICE Projects App iOS' },
  'Documents Android App': { id: 11, name: 'Android', color: '#00c93e', active: false, realName: 'Documents Android App' },
  OnlyOffice: { id: 12, name: 'OnlyOffice', color: '#ffc800', active: false, realName: 'OnlyOffice' },
  'OnlyOffice Install': { id: 13, name: 'O. Install', color: '#ff6e6e', active: false, realName: 'OnlyOffice Install' }};

  public static readonly SEVERITIES =
  {critical: { id: 1, name: 'Critical/Blocker', realName: 'critical', addition: ['blocker'], color: '#ff0000', active: false },
  major: { id: 2, name: 'Major', realName: 'major', color: '#ff8922', active: false, addition:[] },
  normal: { id: 3, name: 'Normal', realName: 'normal', color: '#000000', active: false, addition:[] },
  minor: { id: 4, name: 'Minor/Trivial', realName: 'minor', addition: ['trivial'], color: '#8d8d8d', active: false },
  enhancement: { id: 5, name: 'Enhancement', realName: 'enhancement', isFeature: true, color: '#30ac09', active: false, addition:[] }};

  public static readonly STATUSES =
  {NEW: { id: 1, name: 'New/Assigned/Reopen', realName: 'NEW', addition: ['ASSIGNED', 'REOPENED'],
          active: false, nextStatus: ['FIXED', 'INVALID', 'WANTFIX'] },
  RESOLVED: { id: 2, name: 'Resolved', realName: 'RESOLVED', active: false , nextStatus: ['VERIFIED', 'NEW'], addition: []},
  VERIFIED: { id: 3, name: 'Verified/Closed', realName: 'VERIFIED', addition: ['CLOSED'], active: false, nextStatus: ['NEW', 'RESOLVED']}};

  public static readonly PRIORITIES =
  {P1: { id: 1, name: 'P1', realName: 'P1' },
  P2: { id: 2, name: 'P2', realName: 'P2' },
  P3: { id: 3, name: 'P3', realName: 'P3' },
  P4: { id: 4, name: 'P4', realName: 'P4' },
  P5: { id: 5, name: 'P5', realName: 'P5' }};
}
