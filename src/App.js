import React, {useCallback, useEffect, useRef, useState} from 'react';
import './App.css';
import { initNotifications } from '@mycv/f8-notification';
import { FaVolumeUp, FaFacebook, FaTwitter, FaYoutube, FaGithub } from "react-icons/fa";
import  modelDescription from './model-description';
import {soundURL} from 'howler';
import logo from './images/logo.png';
import * as tf from "@tensorflow/tfjs";
import Webcam from "react-webcam";
import * as mobilenet from '@tensorflow-models/mobilenet';
// import * as knnClassifier from '@tensorflow-models/knn-classifier';

// const NOT_LABEL = "not_label";
// const LABEL = "label";
// const TrainingData = 50;
// const LABEL_CONFIDENCE = 0.8;
function App() {
 

  const [state, setState] = useState(false);

  // const toggle = () =>{
  //   setState(!state);
  // }
  const urlRef = useState();
  const photoRef = useRef();
  const videoRef = useRef();
  const predictionList = document.querySelector('#prediction-list');
  // const classifier = useRef();
  // const mobilenetModule = useRef();

  const init = async () =>{
    console.log('init....');
    await setUpCamera();
    console.log('init done');

    // classifier.current = knnClassifier.create();

    // mobilenetModule.current = await mobilenet.load();
    console.log("Set-up done");
  }
  
  const setUpCamera = () =>{
    return new Promise((resolve , reject) =>{
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

      if(navigator.getUserMedia){
        navigator.getUserMedia(
          {video: true}, 
          stream => {
            videoRef.current.srcObject = stream;
            videoRef.current.addEventListener('loadeddata',resolve);
          },
          error => {reject(error);}
        );
      }else{
        reject(new Error('getUserMedia not supported'));
      }
    })
  }


  // const sleep = (ms = 0) => {
  //   return new Promise(resolve => setTimeout(resolve, ms));
  // }

  // const train = async label => {
  //   console.log('training....');
  //   console.log(`[${label}] is training...`);
  //   for(let i=0 ; i<TrainingData ; ++i){
  //     console.log(`Progress ${ (i + 1) / TrainingData * 100}%`);
  //     await sleep(100);
  //     training(label);
  //   }
  // }

/*
  Bước 1: train máy không có label
  Bước 2: train máy có label
  Bước 3: Lấy label hiện tại, analyst and compare data had been learned before
  ==> Nếu là matching với data label => warning

  *@param {*} label
*/

  // const training = label => {
  //    return new Promise(async resolve => {
  //     const embedding = mobilenetModule.current.infer(
  //       videoRef.current,
  //       true
  //     );
  //     classifier.current.addExample(embedding, label);
  //     resolve();
  //   });
  // }

  // const run = async () => {
  //   const embedding = mobilenetModule.current.infer(
  //     videoRef.current,
  //     true
  //   );
  //   const result = await classifier.current.predictClass(embedding);
  //   // console.log('Label: ', result.label);
  //   // console.log('Confidences: ', result.confidences);
    
  //   if (result.label === LABEL && result.confidences[result.label] > LABEL_CONFIDENCE) {
  //     console.log('Label: ');
  //       notify('Put your label', { body: 'You re aldready put your label on camera' });
  //     setLabel(true);
  //   }else{
  //     console.log('Not label: ');
  //     setLabel(false);
  //   }
  //   await sleep(200);
  //   run();
  // };
  
  const takePicture = async () => {
    const width = 840;
    const height = width / (16/10);

    let video = videoRef.current;
    let photo = photoRef.current;
    let url = urlRef.current;
    photo.width = width;
    photo.height = height;

    let ctx = photo.getContext('2d');
    ctx.drawImage(video,0,0,photo.width,photo.height);
    

    let photoUrl = photo.toDataURL('image/png',100);
    url = photoUrl;
    console.log(photo);
  };

  //clear image 
  const clearImage = async () => {
    let photo = photoRef.current;
    let ctx = photo.getContext('2d');
    ctx.clearRect(0,0,photo.width,photo.height);
    console.log('clearImage working');
    // setHasPhoto(false);
  };

  const loadModel = async () => {
    const model = await tf.loadLayersModel('./model/model.json');
    return model;
  };
  
  const loadedModel = loadModel();

  const predict = async () => {
    console.log('predict');
    const model = await loadedModel;
  
    const offset = tf.scalar(127.5);
    const tensor = tf.browser.fromPixels(photoRef)
      .resizeNearestNeighbor([224, 224])
      .toFloat()
      .sub(offset)
      .div(offset)
      .expandDims();
  
    const prediction = await model.predict(tensor).data();
  
    const top5 = Array.from(prediction)
      .map((prob, idx) => ({ probability: prob, name: modelDescription[idx] }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5);
  
    let elements = '';
    top5.forEach(({ probability, name }) => {
      const percent = Number(probability * 100).toFixed(2);
      elements += `<li class="prediction-list-item"><span class="prediction-item-name">${name}</span> <span class="prediction-item-probability">${percent}%</span></li>`;
    });
    predictionList.innerHTML = elements;

  };
  const soundSrc = '';
  const audio = (src) => {
    const sound = new soundURL({
      src,
      html5: true
    });
    sound.play();
  };


  useEffect(() =>{
    init();
     initNotifications({cooldown: 3000});
    //clean-up
    return () =>{

    }
  },[]);
  return (
    <div className={`main `}>
      <div className="Header">
        <div className="Logo">
         <img className="Logo-header" alt='Logo' src={logo} />
         <h1 className="Name-header">Smile</h1>
        </div>
        <div className='navbar-links' >
          <ul>
            <li><a href='#'>Trang chủ</a></li>
            <li><a href='#'>Thông tin</a></li>
            <li><a href='#'>Liên hệ</a></li>
          </ul>
        </div>

          {/* <button className='nav-btn' onClick={showNavbar}>
            <FaBars/>
          </button> */}
      </div>

      <div className="Body">
        <div className="btn-show">
          <button type="button" className="btn btn-toggle" onClick={() => setState(!state)}>
            {state ? "Tắt camera" : "Mở camera"}
          </button>
        </div>
        <div className={`webcam-container ${state ? 'show' : 'hide'}`}>
          <div className='webcam-camera'>
            <video
              ref={videoRef}
              className="webcam" 
              autoPlay
            />
          </div>  
          <div className="controls">
            {/* <button className="btn btn-train-one" onClick={() => {train(NOT_LABEL)}}>Train 1</button>
            <button className="btn btn-train-one" onClick={() => {train(LABEL)}}>Train 2</button> */}
            <button className="btn btn--run" onClick={() => {predict()}} >Quét ảnh</button>
            <button className="btn btn--takePicture" onClick={() => {takePicture()}} >Chụp ảnh</button>
            <button className="btn btn--takePicture" onClick={() => {clearImage()}} >Xóa ảnh</button>
          </div>
          <div className="output-data">
            <input type="text" className="output-textbox" placeholder="" disabled/>
          </div>
          <div className="volume-data">
            <i className='volume-icon'onClick={() => {audio(soundSrc)}}><FaVolumeUp/></i>
          </div>
          <canvas ref={photoRef} src={urlRef}></canvas>
          <div class="section prediction">
          <ol class="prediction-list" id="prediction-list"></ol>
      </div>
        </div>
      </div>

      <footer class="footer-distributed">
      <div class="footer-left">
          <h3>Website <span>Smile</span></h3>

          <p class="footer-links">
              <a href="#">Trang chủ</a>
              |
              <a href="#">Thông tin</a>
              |
              <a href="#">Liên hệ</a>
          </p>

          <p class="footer-company-name">Đề tài <b>Website học từ vựng tiếng Việt/tiếng Anh bằng cách quét ảnh</b></p>
      </div>

      <div class="footer-center">
          <div>
              <i class="fa fa-map-marker"></i>
              <p><span>Đại học</span>
                  Thủy Lợi</p>
          </div>

          <div>
              <i class="fa fa-phone"></i>
              <p>+91 **********</p>
          </div>
          <div>
              <i class="fa fa-envelope"></i>
              <p><a href="mailto:sagar00001.co@gmail.com">ducm*****@gmail.com</a></p>
          </div>
      </div>
      <div class="footer-right">
          <p class="footer-company-about">
              <span>Thông tin về nhóm</span>
             
          </p>
          <div class="footer-icons">
              <a href="#"><FaFacebook/></a>
              <a href="#"><FaTwitter/></a>
              <a href="#"><FaGithub/></a>
              <a href="#"><FaYoutube/></a>
          </div>
      </div>
      </footer>

    </div>
  );
}

export default App;
