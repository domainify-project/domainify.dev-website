import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Use it easily',
    Img: require('@site/static/img/easy-to-use.png').default,
    description: (
      <>
        It helps to implement a Backend service in detail easily. Domainify is easy to learn and use too.
      </>
    ),
  },
  {
    title: 'Focus on your business logic',
    Img: require('@site/static/img/focus-on-the-business-logic.png').default,
    description: (
      <>
        The main goal of Domainify is to reduce codes and simply cover most technical cases for developers to be prepared to focus on the business logic.
      </>
    ),
  },
  {
    title: 'Don\'t worry about complexity and scalability',
    Img: require('@site/static/img/do-not-worry-about-scalability.png').default,
    description: (
      <>
        Domainify has been designed based on Clean Architecture and the DDD (Domain-Driven Design) approaches.
      </>
    ),
  },
];

function Feature({ Img, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <img src={Img} alt={title} className={styles.featureImage} />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
