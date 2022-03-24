import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const IndexPage = (): React.ReactElement => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('register/', { replace: true });
  }, [navigate]);
  return <></>;
};

export default IndexPage;
