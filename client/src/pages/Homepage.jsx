import styled from 'styled-components';
import { Services } from '../components/Services';

const HomePageContainer = styled.div`
  padding: 5rem 3rem 2rem 3rem;
  max-width: 75rem;
  margin: 0 auto;
`;

const Title = styled.div`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-family: 'Poppins', sans-serif;
  line-height: 2rem;
`;

const Text = styled.p`
  font-size: 1rem;
  font-family: 'Poppins', sans-serif;
  line-height: 1.5rem;
`;

function Homepage() {
  return (
    <HomePageContainer>
      <Title>Welcome to Beauty Salon!</Title>
      <Text>
        Explore the beauty!
      </Text>
      <Services />
    </HomePageContainer>
  );
}

export default Homepage;
