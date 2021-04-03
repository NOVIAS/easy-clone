#!/usr/bin/env node

const { program } = require("commander");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const PKG = require("../package.json");

program.version(PKG.version);

program
  .command("clone <targetGit>")
  .option("-d --target dir <targetDir>", "Local directory")
  .description("Clone the git project")
  .action(onClone);

program.parse(process.argv);

function onClone(gitAddress, { target }) {
  if (!String.prototype.startsWith) {
    Object.defineProperty(String.prototype, "startsWith", {
      value: function (search, pos) {
        pos = !pos || pos < 0 ? 0 : +pos;
        return this.substring(pos, pos + search.length) === search;
      },
    });
  }
  if (
    !gitAddress.startsWith("https://github.com") &&
    !gitAddress.startsWith("https://github.com.cnpmjs.org")
  ) {
    exit(`Please check that the git address starts with 'https://github.com'`);
  } else {
    // 替换 git 地址
    gitAddress = replaceGitAddress(gitAddress);
  }
  let shell;
  if (isTargetDir(target)) {
    shell = `git clone ${gitAddress} ${isTargetDir(target)}`;
  } else {
    shell = `git clone ${gitAddress}`;
  }
  // 执行 git 命令
  exec(shell, (err) => {
    if (err) exit(err);
  });
  console.log("🤩 clone success!");
}

// 错误处理
function printErr(err) {
  console.error("an error occurred: " + err);
}

/*
 * print message & exit
 */
function exit(err) {
  printErr(err);
  process.exit(1);
}

// 判断是否传入了 targetDir
function isTargetDir(target) {
  if (target) {
    let temPath;
    // 1: 判断传入的是不是路径
    if (isPath(target)) {
      // 目录
      temPath = target;
    } else {
      // 截取上一级 path.parse(target).dir
      temPath = path.parse(target).dir;
      console.log("Path error, select the upper level");
    }
    if (!isExist(temPath)) {
      // 如果目录不存在.创建目录
      fs.mkdir(temPath, { recursive: false }, (err) => {
        if (err) printErr(err);
      });
      console.log("New path created successfully");
    }
    return temPath;
  } else {
    return false;
  }
}

// 判断路径是不是存在, 不存在则创建
function isPath(targetPath) {
  return path.parse(targetPath).ext === "";
}

function isExist(targetPath) {
  return fs.existsSync(targetPath);
}

function replaceGitAddress(gitRepo) {
  if (gitRepo.startsWith("https://github.com")) {
    const regex = /^https:\/\/github\.com/;
    return gitRepo.replace(regex, "https://github.com.cnpmjs.org");
  }
  return gitRepo;
}
