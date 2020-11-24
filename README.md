# Buguette

This is a web application for working with bugzilla

## Build
To build and run this all, you need to use 

```docker-compose up```

By default, app using 80 port, it must be free before runing;

## Update

For easy update you need to use
```
git pull
docker-compose build --no-cache buguette-build 
docker-compose up buguette-build
```

## Adding new users
  Adding new users for buguette consists of 2 steps: adding avatars, and adding emails. 
  
### Adding emails
  All users for buguette is placed to one comment in bugzilla. Id of this comment is placed in [static data](https://github.com/ONLYOFFICE-QA/buguette/blob/master/src/app/static-data.ts) - `COMMENT_WITH_USER_DATA`. This comment usually located at [`BUG_WITH_ATTACHMENTS`](https://github.com/ONLYOFFICE-QA/buguette/blob/master/src/app/static-data.ts#L3)
  
  This is comment for bug `BUG_WITH_ATTACHMENTS`, and you can open this bug, and find comment in source code of bug page (open development tools on your browser, open `Elements` tab, then `CTRL + F` and paste comment id)

  If you want to update list of users, you need to create new comment in this bug and then update `COMMENT_WITH_USER_DATA` from statis data. 

  1. Open bug with comment with user list (probably `BUG_WITH_ATTACHMENTS`)
  2. Paste list of users by format `[{"email": "email@gmail.com", "real_name": "Ivanov Ivan"},...]`*
    Do not forget to use double quotes, because it is json data.

  3. Create comment
  4. Get `comment id`. The easest way - is a inspect if `tag` link in created comment. 
    Example: `<a href="#" onclick="YAHOO.bugzilla.commentTagging.toggle(172072, 3);return false">tag</a>`
    `172072` - is a id of comment
  5. Update `COMMENT_WITH_USER_DATA` in static data
  6. Update buguette clientside

*The easyst way to get current user list from bugzilla is a copy list for `cc` on New Bug page
1. Open page for creating new bug in bugzilla
2. Find element with xpath `//*[@id="cc"]`, and copy all of childs
3. Paste it in your favorite code editor
4. Feel free all your regexp magic for make json from it 

### Adding avatars

  All avatars is a attachments in `BUG_WITH_ATTACHMENTS` bug. You can add new avatars for new users like new attachments, but you need to use some rules for it:
1. **Name of image** and **description for attachment** must to be like **username** of user. Username is a part of email before `@`. Attantion! `Username !== real_name`
2. You must to use only **`jpg`** format for images
3. The image must be square
4. The image must be not more of 10 kb size*

*Size of image is importante because bugzilla can not to send only some attachments of all. Take all or take nothing. And it will be good to make attachments not very big
