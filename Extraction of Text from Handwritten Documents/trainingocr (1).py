import paddle
from paddle.io import DataLoader , Dataset
from paddle.optimizer import Adam
from paddle.optimizer.lr import PiecewiseDecay
from paddle.static import InputSpec
from paddle.metric import Accuracy
from visualdl import LogWriter

# Define your training and validation datasets and data loaders
import cv2
import numpy as np

global_step = 0 

class TrainingConfig:
    EPOCHS = 10  # Number of training epochs
    BATCH_SIZE = 32  # Batch size for training
    LEARNING_RATE = 0.001  # Learning rate
    SAVE_EVERY = 1  # Save model checkpoints every X epochs (adjust as needed)


# Load the image file
image = cv2.imread("/content/7/7.jpeg")

# Create a Dataset object from the image data
class ImageDataset(Dataset):
    def __init__(self, image):
        self.image = image

    def __getitem__(self, index):
        return self.image

    def __len__(self):
        return 1

class ValidationDataset(paddle.io.Dataset):
    def __init__(self, validation_data, validation_labels):
        self.validation_data = "/content/7/7.jpeg"
        self.validation_labels = "/content/7/7test.txt"

    def __getitem__(self, index):
        data = self.validation_data[index]
        label = self.validation_labels[index]
        return data, label

    def __len__(self):
        return len(self.validation_data)
        

        


# Create a DataLoader object from the Dataset object
train_loader = DataLoader(ImageDataset(image), batch_size=TrainingConfig.BATCH_SIZE, shuffle=True)



# Define your model architecture
model = paddle.nn.Sequential(
    paddle.nn.Conv2D(in_channels=3, out_channels=32, kernel_size=3, stride=1, padding=1),
    paddle.nn.MaxPool2D(kernel_size=2, stride=2),
    paddle.nn.Conv2D(in_channels=32, out_channels=64, kernel_size=3, stride=1, padding=1),
    paddle.nn.MaxPool2D(kernel_size=2, stride=2),
    paddle.nn.Flatten(),
    paddle.nn.Linear(64 * 7 * 7, 128),
    paddle.nn.Linear(128, 10),
)

# Define your loss function
criterion = paddle.nn.CrossEntropyLoss()

# Define your optimizer (e.g., Adam)
optimizer = Adam(learning_rate=TrainingConfig.LEARNING_RATE, parameters=model.parameters())

# Learning rate scheduler (optional)
lr_scheduler = PiecewiseDecay(boundaries=[...], values=[...])

# Define evaluation metrics (e.g., accuracy)
metric = Accuracy()

# Initialize a VisualDL logger for logging (optional)
visualdl_logger = LogWriter(logdir='log')

# Training loop
for epoch in range(TrainingConfig.EPOCHS):
    model.train()
    for batch in train_loader:
        inputs, targets = batch
        outputs = model(inputs)
        loss = criterion(outputs, targets)
        loss.backward()
        optimizer.step()
        optimizer.clear_grad()
        # Update learning rate (optional)
        lr_scheduler.step()

        # Log training loss (optional)
        visualdl_logger.add_scalar('train/loss', loss.numpy(), global_step=global_step)

validation_data = "/content/7/7.jpeg"  # Load your validation images
validation_labels = "/content/7/7test.txt" # Load your validation labels
class ValidationConfig:
    BATCH_SIZE = 32  # Batch size for validation

validation_dataset = ValidationDataset(validation_data, validation_labels)
valid_loader = DataLoader(validation_dataset, batch_size=ValidationConfig.BATCH_SIZE, shuffle=False)


    # Validation loop
model.eval()
metric.reset()
for batch in valid_loader:
        inputs, targets = batch
        outputs = model(inputs)
        metric.update(outputs, targets)
accuracy = metric.accumulate()

    # Log validation accuracy (optional)
visualdl_logger.add_scalar('eval/accuracy', accuracy, global_step=global_step)

    # Save model checkpoint (optional)
if (epoch + 1) % TrainingConfig.SAVE_EVERY == 0:
        paddle.save(model.state_dict(), f'model_checkpoint_epoch_{epoch + 1}.pdparams')
