import React, { useState } from 'react';
import Head from 'next/head';
import styled from 'styled-components';

import { T } from '../components';
import { UPLOAD_URL } from '../constants';
import { picFile } from '../utils';

const IndexPage = () => {
  const [loading, setLoading] = useState(false);
  return (
    <Main>
      <Head>
        <title>mask-it-up</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
        />
      </Head>
      <h1>{UPLOAD_URL}</h1>
      {loading}
      <T id="test"></T>
      <canvas id="canvas"></canvas>
      <input id="fileinput" type="file" onChange={() => picFile(setLoading)} />
    </Main>
  );
};

const Main = styled.main`
  background: var(--background-dark);
`;

export default IndexPage;
