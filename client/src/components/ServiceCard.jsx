import { styled } from 'styled-components';
// import { useContext } from "react";
import deleteIcon from '../assets/delete.svg';
import editIcon from '../assets/edit.svg';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../utils/AuthContext';
import { useContext } from 'react';
import format from 'date-fns/format';

const Container = styled.div`
  border: 1px solid #dddddd;
  border-radius: 0.25rem;
  max-width: 25rem;
  height: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  @media (max-width: 48em) {
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
`;

const Title = styled.p`
  font-weight: 500;
  font-size: 1.25rem;
  word-break: break-word;
  user-select: none;
  cursor: pointer;
`;

const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 10rem;
  overflow: hidden;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0.25rem;
`;

const OtherInfo = styled.p`
  font-weight: 500;
  font-size: 1rem;
  word-break: break-word;
  user-select: none;
  cursor: pointer;
`;

const ScheduleList = styled.ul`
  list-style-type: none;
  padding-top: 0.5rem;
`;

const ScheduleItem = styled.li`
  margin-bottom: 0.25rem;
  line-height: 2rem;
`;

const IconContainer = styled.p`
  display: flex;
  gap: 0.5rem;
`;
const StyledIcon = styled.img`
  width: 2rem;
  &:hover {
    filter: brightness(0.5);
    transform: scale(0.9);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Button = styled.button`
  background-color: #ffffff;
  color: #000;
  border: 1px solid #dddddd;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 1rem;
  transition:
    background-color 0.3s,
    color 0.3s,
    transform 0.3s;
  &:hover {
    background-color: #dddddd;
    transform: scale(1.05);
  }
`;

export const ServiceCard = ({
  id,
  title,
  image,
  category,
  schedule,
  rating,
  onDeleteModalOpen,
  isVisible
}) => {
  const navigate = useNavigate();

  const { isAuthenticated, isAdmin } = useContext(AuthContext);

  const onDeleteClick = async () => {
    onDeleteModalOpen(id);
  };

  return (
    <>
      <Container onClick={() => navigate(`/services/${id}`)}>
        <Header>
          <Title>{title}</Title>
          {image && (
            <ImageContainer>
              <Image src={image} alt={title} />
            </ImageContainer>
          )}
        </Header>
        <OtherInfo>Category: {category}</OtherInfo>
        <OtherInfo>Rating: {rating}</OtherInfo>
        <OtherInfo>
          Schedule:
          <ScheduleList>
            {schedule.map((item, index) => (
              <ScheduleItem key={index}>{format(new Date(item.date_time), 'yyyy.MM.dd HH:mm') + ' val.'}</ScheduleItem>
            ))}
          </ScheduleList>
        </OtherInfo>
        {isAuthenticated && !isAdmin && (
          <ButtonContainer>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/services/${id}/addreview`);
              }}
            >
              Add Review
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/services/${id}/register`);
              }}
            >
              Register
            </Button>
          </ButtonContainer>
        )}
        <IconContainer>
          {isVisible && (
            <StyledIcon
              src={editIcon}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/services/${id}/edit`);
              }}
            />
          )}
          {isVisible && (
            <StyledIcon
              src={deleteIcon}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteClick();
              }}
            />
          )}
        </IconContainer>
      </Container>
    </>
  );
};
