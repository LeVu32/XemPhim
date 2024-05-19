import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import validator from "validator";
import md5 from "md5";
import User from "../models/UserModel.js";
import Film from "../models/FilmModel.js";
import {
  sendMailForgotPass,
  sendMailRegister,
} from "../Queue/sendMail.queue.js";
import { cacheOtp, getOtp } from "../Redis/initRedis.js";
import { getObjectSignedUrl } from "./S3Controller.js";

export async function register(req, res) {
  try {
    const { username, password, displayname } = req.body;
    const data = await User.find({ username: username.toLowerCase() });
    if (data?.length > 0) {
      return res.json({ status: false, message: "Tài khoản đã tồn tại" });
    }
    sendMailRegister(username, "dahashophihi@gmail.com", "hihi");
    const newUser = new User({
      displayname: displayname,
      username: username.toLowerCase(),
      password: md5(password),
    });
    await newUser.save();
    return res.json({ status: true, message: `Create ${username} done` });
  } catch (err) {
    console.log(err);
    res.json({ status: false, message: err.message });
  }
}

export async function login(req, res) {
  try {
    const { username, password } = req.body;

    const data = await User.findOne({
      username: username.toLowerCase(),
      password: md5(password),
    });
    console.log(data);
    if (data) {
      const payload = data.toObject();
      const token = jwt.sign(payload, process.env.JWT_SECRET_TOKEN);
      console.log(token);
      res.json({ status: true, token: token });
    } else {
      res.json({
        status: false,
        message: "Tài Khoản Hoặc Mật Khẩu Không Chính Xác",
      });
    }
  } catch (err) {
    console.log(err);
    res.json({ status: false, message: err });
  }
}

export async function view(req, res) {
  try {
    const data = req.dataUser;
    if (data) {
      let { id } = req.body;
      console.log(id);
      let timespan = Date.now();
      let datafilm = await Film.findOne({ _id: id });
      //update view
      datafilm.view++;
      await Film.findOneAndUpdate(
        { _id: id },
        { $set: { view: datafilm.view } }
      );
      //push id to history
      let dataUser = await User.findOne({
        username: data.username.toLowerCase(),
      });
      if (dataUser.toObject().history.length == 0) {
        await User.findOneAndUpdate(
          { username: data.username.toLowerCase() },
          { $push: { history: { id: id, timespan: timespan } } }
        );
      } else {
        let isExit = false;
        let index = 0;
        for (let i = 0; i < dataUser.toObject().history.length; i++) {
          if (dataUser.toObject().history[i].id == id) {
            isExit = true;
            index = i;
          }
        }
        if (isExit) {
          let newArr = [];
          for (let j = 0; j < dataUser.toObject().history.length; j++) {
            if (j == index) {
              let mm = dataUser.toObject().history[j];
              mm.timespan = timespan;
              newArr.push(mm);
            } else {
              let mm = dataUser.toObject().history[j];
              newArr.push(mm);
            }
          }
          newArr.sort((item1, item2) => {
            if (item1.timespan < item2.timespan) {
              return -1;
            }
            if (item1.timespan > item2.timespan) {
              return 1;
            }
            return 0;
          });
          await User.findOneAndUpdate(
            { username: data.username.toLowerCase() },
            { $set: { history: newArr } }
          );
        } else {
          await User.findOneAndUpdate(
            { username: data.username.toLowerCase() },
            { $push: { history: { id: id, timespan: timespan } } }
          );
        }
      }

      res.json({ status: true });
    } else {
      res.json({ status: false, message: "Bạn cần đăng nhập để xem" });
    }
  } catch (err) {
    console.log(err);
    res.json({ status: false, message: err });
  }
}

async function getFilm(id) {
  let data = await Film.findOne({ _id: id });
  data.film = await getObjectSignedUrl(data.film);
  data.image = await getObjectSignedUrl(data.image);

  // Process the episodes asynchronously
  data.episode = await Promise.all(
    data.episode.map(async (item) => {
      return {
        ...item,
        film: await getObjectSignedUrl(item.film),
        image: await getObjectSignedUrl(item.image),
      };
    })
  );
  return data;
}
export async function getHistoryView(req, res) {
  try {
    const data = req.dataUser;
    if (data) {
      let dataUser = await User.findOne({
        username: data.username.toLowerCase(),
      });
      console.log(dataUser.toObject().history);
      let result = [];
      for (let i = 0; i < dataUser.toObject().history.length; i++) {
        await getFilm(dataUser.toObject().history[i].id).then((data) => {
          let res = {
            timespan: dataUser.toObject().history[i].timespan,
            film: data,
          };
          result.push(res);
        });
      }
      res.json({ status: true, data: result.reverse() });
    } else {
      res.json({ status: false, message: "JWT sai" });
    }
  } catch (err) {
    console.log(err);
    res.json({ status: false, message: err });
  }
}
export async function getInfo(req, res) {
  try {
    const data = req.dataUser;
    if (data) {
      res.json({ status: true, message: data });
    } else {
      res.json({ status: false, message: "JWT sai" });
    }
  } catch (err) {
    console.log(err);
    res.json({ status: false, message: err });
  }
}

export async function search(req, res) {
  try {
    const data = req.dataUser;
    if (data) {
      const { search } = req.body;
      if (search.length > 0) {
        const regex = new RegExp(search, "i");

        await User.findOneAndUpdate(
          { username: data.username.toLowerCase() },
          { $addToSet: { search: search } }
        );

        const datasearch = await Film.find({
          $or: [{ description: regex }, { name: regex }],
        });
        const result = await Promise.all(
          datasearch.map(async (item) => {
            console.log(item);
            return await getFilm(item._id);
          })
        );

        res.json({ status: true, data: result });
      } else {
        res.json({ status: false, message: "Không được để trống" });
      }
    } else {
      res.json({ status: false, message: "JWT sai" });
    }
  } catch (err) {
    console.log(err);
    res.json({ status: false, message: err.message });
  }
}

export async function getSearch(req, res) {
  try {
    const data = req.dataUser;
    if (data) {
      let dataUser = await User.findOne({
        username: data.username.toLowerCase(),
      });
      res.json({ status: true, data: dataUser.toObject().search.reverse() });
    } else {
      res.json({ status: false, message: "JWT sai" });
    }
  } catch (err) {
    console.log(err);
    res.json({ status: false, message: err });
  }
}
export async function like(req, res) {
  try {
    const data = req.dataUser;
    if (data) {
      let { id } = req.body;
      let timespan = Date.now();
      console.log(timespan);
      let dataUser = await User.findOne({
        username: data.username.toLowerCase(),
      });
      if (dataUser.toObject().likedvideo == 0) {
        await User.findOneAndUpdate(
          { username: data.username.toLowerCase() },
          { $push: { likedvideo: { id: id, timespan: timespan } } }
        );
      } else {
        let isExit = false;
        let index = 0;
        for (let i = 0; i < dataUser.toObject().likedvideo.length; i++) {
          if (dataUser.toObject().likedvideo[i].id == id) {
            isExit = true;
            index = i;
          }
        }
        if (isExit) {
          let newArr = [];
          for (let j = 0; j < dataUser.toObject().likedvideo.length; j++) {
            if (j == index) {
              let mm = dataUser.toObject().likedvideo[j];
              mm.timespan = timespan;
              newArr.push(mm);
            } else {
              let mm = dataUser.toObject().likedvideo[j];
              newArr.push(mm);
            }
          }
          newArr.sort((item1, item2) => {
            if (item1.timespan < item2.timespan) {
              return -1;
            }
            if (item1.timespan > item2.timespan) {
              return 1;
            }
            return 0;
          });
          await User.findOneAndUpdate(
            { username: data.username.toLowerCase() },
            { $set: { likedvideo: newArr } }
          );
        } else {
          await User.findOneAndUpdate(
            { username: data.username.toLowerCase() },
            { $push: { likedvideo: { id: id, timespan: timespan } } }
          );
        }
      }

      res.json({ status: true });
    } else {
      res.json({ status: false, message: "Bạn cần đăng nhập để xem" });
    }
  } catch (err) {
    console.log(err);
    res.json({ status: false, message: err });
  }
}

export async function getLiked(req, res) {
  try {
    const data = req.dataUser;
    if (data) {
      const dataUser = await User.findOne({
        username: data.username.toLowerCase(),
      });

      if (!dataUser) {
        return res.json({ status: false, message: "User không tồn tại" });
      }

      const likedVideos = dataUser.toObject().likedvideo;
      console.log("likedVideos", likedVideos);
      const resultPromises = likedVideos.map(async (likedVideo) => {
        const filmData = await getFilm(likedVideo.id);
        return {
          film: filmData,
          timespan: likedVideo.timespan,
        };
      });
      const result = await Promise.all(resultPromises);
      console.log(result);

      res.json({ status: true, data: result.reverse() });
    } else {
      res.json({ status: false, message: "JWT sai" });
    }
  } catch (err) {
    console.log(err);
    res.json({ status: false, message: err.message });
  }
}

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.json({ status: false, message: "Không được để trống email" });
    }
    const data = await User.findOne({ username: email.toLowerCase() });
    if (!data) {
      return res.json({ status: false, message: "Email không tồn tại" });
    }
    const otp = Math.floor(1000 + Math.random() * 9000);
    const cache = await cacheOtp(email.toLowerCase(), otp);
    console.log(cache);

    sendMailForgotPass(email.toLowerCase(), "dahashophihi@gmail.com", otp);
    return res.json({ status: true, message: "Mã OTP đã được gửi" });
  } catch (err) {
    console.log(err);
    res.json({ status: false, message: err });
  }
};

export const confirmOTP = async (req, res) => {
  try {
    const { otp, email } = req.body;
    console.log(email);
    const data = await User.findOne({ username: email.toLowerCase() });
    if (!data) {
      return res
        .status(400)
        .json({ status: false, message: "Email không tồn tại" });
    }
    const cache = await getOtp(email.toLowerCase());
    console.log(cache);
    if (otp != cache) {
      return res.status(400).json({ status: false, message: "OTP khong dung" });
    }
    const token = jwt.sign({ email: email }, process.env.JWT_SECRET_TOKEN);
    console.log(token);
    return res
      .status(200)
      .json({ status: true, message: "success", data: token });
  } catch (err) {
    console.log(err);
    res.json({ status: false, message: err });
  }
};

export const changePass = async (req, res) => {
  try {
    const { password, rePassword } = req.body;
    if (password !== rePassword) {
      return res
        .status(400)
        .json({ status: false, message: "Mat khau khong khop" });
    }
    const { email } = req.dataUser;
    const data = await User.findOne({ username: email.toLowerCase() });
    if (!data) {
      return res
        .status(400)
        .json({ status: false, message: "Email không tồn tại" });
    }
    data.password = md5(password);
    await data.save();
    return res
      .status(200)
      .json({ status: true, message: "success", data: data });
  } catch (err) {
    console.log(err);
    res.json({ status: false, message: err });
  }
};
