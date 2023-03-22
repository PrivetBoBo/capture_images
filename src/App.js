import React, { useEffect, useRef, useState} from 'react';
import './App.css';
import { FaVolumeUp, FaFacebook, FaTwitter, FaYoutube, FaGithub } from "react-icons/fa";
import  modelDescription from './model-description';
import logo from './images/logo.png';
import * as tf from "@tensorflow/tfjs";
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
import { useSpeechSynthesis } from 'react-speech-kit';

function App() {
  const [state, setState] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [model, setModel] = useState(null);
  const [results, setResults] = useState([]);
  const [text, setText] = useState('');

  function speak(text) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
  }
  const handleOnClick = () => {
    if (results && results.length) 
  {
    speak(results[0].className);
  }
  }

  console.log(text && speak(text));

  // if (results && results.length) 
  // {
  //   speak(results[0].className);
  // }

  // const toggle = () =>{
  //   setState(!state);
  // }
  const urlRef = useRef();
  const photoRef = useRef();
  const videoRef = useRef({});
  const [srcObject,setSrcObject] = useState({});
  const loadModel = async () => {
    setIsModelLoading(true);
    try{
      const model = await mobilenet.load();
      setModel(model);
      setIsModelLoading(false);
    }catch (error){
      console.log("error");
    }
  }


  const init = async () =>{
    console.log('init....');
    await setUpCamera();
    console.log("Set-up done");
  }
  
  const setUpCamera = () =>{
    return new Promise((resolve , reject) =>{
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

      if(navigator.getUserMedia){
        navigator.getUserMedia(
          {video: true}, 
          stream => {
            // videoRef.current = {
            //   ...videoRef.current,
            //   srcObject : stream
              
            // }
          setTimeout(() => {
            videoRef.current.srcObject = stream;
            // videoRef.current.addEventListener('loadeddata',resolve);
          },1000)
            console.log(videoRef.current + ' loaded');
          },
          error => {reject(error);}
        );
      }else{
        reject(new Error('getUserMedia not supported'));
      }
    })
  }
  
  const takePicture = async () => {
    const width = 620;
    const height = width / (16/10);

    let video = videoRef.current;
    let photo = photoRef.current;
    let url = urlRef.current;
    photo.width = width;
    photo.height = height;
    let ctx = photo.getContext('2d');
    ctx.drawImage(video,0,0,photo.width,photo.height);
    let photoUrl = photo.toDataURL('image/png',1.5);
    url = photoUrl;
    // console.log(url);
  };

  //clear image 
  const clearImage = async () => {
    let photo = photoRef.current;
    let ctx = photo.getContext('2d');
    ctx.clearRect(0,0,photo.width,photo.height);
    console.log('clearImage working'); 
  };
  const identify = async () => {
    // textInputRef.current.value = ''
    const results = await model.classify(photoRef.current);
    // console.log(results);
    setResults(results);
  }

  useEffect(() =>{
    init();
    loadModel();
    //clean-up
    return () =>{
    }
  },[]);
  if (isModelLoading){
    return <h2>Is Loading...</h2>
  }
  console.log(results);

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
            <button className="btn btn--run" onClick={() => {identify()}} >Quét ảnh</button>
            <button className="btn btn--takePicture" onClick={() => {takePicture()}} >Chụp ảnh</button>
            <button className="btn btn--takePicture" onClick={() => {clearImage()}} >Xóa ảnh</button>
          </div>
          {results.length > 0 && <div className="output-data">
          {results.map((result, index) => {
                  return (
                      <div className='result-output-data' key={result.className}>
                        {index === 0 && <input type="text" className="output-textbox" placeholder="" value={result.className} disabled/>}
                      </div>
                 )
                })}
          </div>}
          <div className="volume-data">
            <i className='volume-icon'onClick={() => {handleOnClick()}}><FaVolumeUp/></i>
          </div>
          <canvas ref={photoRef} src={urlRef}></canvas>
          {results.length > 0 && <div className='resultsHolder'>
             {results.map((result, index) => {
                  return (
                     <div className='result' key={result.className}>
                       <span className='name'>{result.className}</span>
                       <span className='confidence'>Confidence level: {(result.probability * 100).toFixed(2)}% {index === 0 && <span className='bestGuess'>Best Guess</span>}</span>
                      </div>
                 )
                })}
           </div>}
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
