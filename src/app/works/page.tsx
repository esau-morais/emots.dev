import { Container } from '@/components/Container'
import { WorksList } from '@/components/WorksList'

export const metadata = {
  title: 'Works',
}

const Works = () => {
  return (
    <Container>
      <WorksList />
    </Container>
  )
}

export default Works
