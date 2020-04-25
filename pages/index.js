import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { picFile } from '../utils';

const IndexPage = () => {
  useEffect(() => {
    const setResizeVariables = () => {
      // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
      let vh = window.innerHeight * 0.01;
      // Then we set the value in the --vh custom property to the root of the document
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    window.addEventListener('resize', setResizeVariables);
    setResizeVariables();
    return () => {
      window.removeEventListener('resize', setResizeVariables);
    };
  }, []);
  const [loading, setLoading] = useState(false);
  const [hasPic, sethasPic] = useState(false);
  return (
    <Main>
      <Head>
        <title>Draag een masker</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
        />
      </Head>
      <h1>Draag een masker</h1>

      <div className="wrapper">
        <canvas width="250" height="250" id="canvas"></canvas>
        {!hasPic && (
          <label id="label" htmlFor="fileinput">
            <img src="camera.png" alt="take a picture" />
          </label>
        )}
        {loading && <div className="loading">Masker aan het ophalen...</div>}
        <input
          id="fileinput"
          type="file"
          accept="image/*"
          onChange={() => picFile(setLoading, sethasPic)}
        />
      </div>
      {hasPic && (
        <label id="opnieuw" htmlFor="fileinput">
          nieuwe foto
        </label>
      )}
      <footer>
        Made with ❤️{' '}
        <a href="thomasmaclean.be" target="_blank" rel="noopener noreferrer">
          Thomas MacLean
        </a>
      </footer>
    </Main>
  );
};

const Main = styled.main`
  #opnieuw {
    font-size: 1.4rem;
    text-decoration: underline;
    border: none;
    margin-top: 2rem;
    padding: 8px 16px;
    cursor: pointer;
  }
  h1 {
    margin: 3rem 0;
  }
  height: calc(var(--vh, 1vh) * 100);

  width: 100vw;
  background: rgb(184, 254, 242);
  background: linear-gradient(
    36deg,
    rgba(184, 254, 242, 1) 0%,
    rgba(255, 255, 255, 1) 80%
  );
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  input {
    display: none;
  }
  .wrapper {
    border: 3px dashed grey;
    padding: 1rem;
    position: relative;
    border-radius: 30px;
    overflow: hidden;
  }
  canvas {
    border-radius: 18px;
  }
  .loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;

    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 3rem;
    background: #7777ffba;
    color: white;
    text-shadow: 0px 0 6px black;
  }
  #label {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    cursor: pointer;
    display: flex;
    bottom: 0;
    justify-content: center;
    align-items: center;
    filter: opacity(0.7);
    img {
      width: 50%;
      height: 50%;
    }
  }

  footer {
    position: absolute;
    bottom: 0;

    padding-bottom: 5px;

    a {
      color: inherit;
    }
  }
`;

export default IndexPage;
