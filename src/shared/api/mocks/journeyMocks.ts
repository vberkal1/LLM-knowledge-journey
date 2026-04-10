import type { Journey } from 'shared/lib/types';

export const DEFAULT_JOURNEY_TOPIC = 'Neural Networks and Backpropagation';

export const neuralNetworksJourneyMock: Journey = {
  id: 'journey-neural-networks-backpropagation',
  title: 'Knowledge Journey: Neural Networks and Backpropagation',
  topic: DEFAULT_JOURNEY_TOPIC,
  totalTimeLimitSec: 60, // DEFAULT
  source: 'mock-fallback',
  checkpoints: [
    {
      id: 'checkpoint-foundations',
      order: 1,
      title: 'Network Foundations',
      description: 'Understand what a neural network is made of and what each layer does.',
      activities: [
        {
          id: 'activity-neurons-purpose',
          type: 'multiple-choice',
          question: 'What is the main role of the hidden layers in a neural network?',
          options: [
            'They store the training dataset permanently.',
            'They learn intermediate representations from input features.',
            'They only normalize raw inputs before inference.',
            'They choose the optimizer for training.',
          ],
          correctAnswer: 'They learn intermediate representations from input features.',
          hint: 'Think about feature extraction between input and output.',
          timeLimitSec: 45,
          xpReward: 10,
        },
        {
          id: 'activity-activation-free-response',
          type: 'free-response',
          question: 'Why do neural networks need non-linear activation functions?',
          correctAnswer: ['non-linear', 'complex patterns', 'linear'],
          hint: 'Without non-linearity, stacked layers collapse into something simpler.',
          timeLimitSec: 75,
          xpReward: 14,
        },
        {
          id: 'activity-rank-flow',
          type: 'rank-the-concepts',
          question: 'Put the forward pass steps in the correct order.',
          options: ['Apply activation', 'Produce weighted sum', 'Receive inputs', 'Emit prediction'],
          correctAnswer: ['Receive inputs', 'Produce weighted sum', 'Apply activation', 'Emit prediction'],
          hint: 'Inputs arrive first, prediction comes last.',
          timeLimitSec: 60,
          xpReward: 16,
        },
      ],
    },
    {
      id: 'checkpoint-backprop-core',
      order: 2,
      title: 'Backpropagation Core',
      description: 'Focus on loss, gradients, and how error travels backward through the network.',
      activities: [
        {
          id: 'activity-fill-blank-gradient',
          type: 'fill-blank',
          question: 'Fill the blank: Backpropagation uses the chain rule to compute ____. ',
          correctAnswer: 'gradients',
          hint: 'The result tells us how parameters should change.',
          timeLimitSec: 40,
          xpReward: 10,
        },
        {
          id: 'activity-teach-back',
          type: 'teach-back',
          question: 'Teach back how gradients help update weights after the loss is measured.',
          correctAnswer: ['gradient', 'weight', 'loss', 'update'],
          hint: 'Mention how the model measures error and nudges weights.',
          timeLimitSec: 90,
          xpReward: 18,
        },
        {
          id: 'activity-debug-logic',
          type: 'debug-logic',
          question:
            'A model never improves because every gradient becomes zero after the first layer. What is the most plausible issue?',
          options: [
            'The dataset has too many labels.',
            'The activations saturate, causing vanishing gradients.',
            'The batch size is always exactly one.',
            'The output layer has only one neuron.',
          ],
          correctAnswer: 'The activations saturate, causing vanishing gradients.',
          hint: 'Think about sigmoid or tanh saturation in deep networks.',
          timeLimitSec: 60,
          xpReward: 15,
        },
      ],
    },
    {
      id: 'checkpoint-practice-transfer',
      order: 3,
      title: 'Application and Transfer',
      description: 'Connect the theory to practical model behavior and explain it in plain language.',
      activities: [
        {
          id: 'activity-elif',
          type: 'explain-like-im-five',
          question: 'Explain backpropagation like you are talking to a five-year-old.',
          correctAnswer: ['mistake', 'try again', 'adjust'],
          hint: 'Use simple words: mistake, fix, try again.',
          timeLimitSec: 75,
          xpReward: 15,
        },
        {
          id: 'activity-give-example',
          type: 'give-your-example',
          question: 'Give your own example of how a network improves after making a wrong prediction.',
          correctAnswer: ['prediction', 'error', 'adjust'],
          hint: 'Use any domain, but include error and adjustment.',
          timeLimitSec: 80,
          xpReward: 14,
        },
        {
          id: 'activity-predict-outcome',
          type: 'predict-outcome',
          question: 'What usually happens if the learning rate is set far too high during training?',
          options: [
            'Training converges faster and becomes more stable.',
            'Weights freeze and stop changing entirely.',
            'Loss may oscillate or diverge instead of improving steadily.',
            'The network automatically adds more layers.',
          ],
          correctAnswer: 'Loss may oscillate or diverge instead of improving steadily.',
          hint: 'Updates become too large to settle into a good minimum.',
          timeLimitSec: 50,
          xpReward: 12,
        },
      ],
    },
  ],
};
