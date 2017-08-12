# react-delegate

Fixing the relationship between parent and child in react to avoid callback hells and over-parenting. :)

# Installation
```
npm install --save react-delegate
```

# Basic idea (Parent)
The delegate turns a TaskList component (parent):
```
/* BEFORE */
class TaskList extends React.Component {
  constructor(props) {
    super(props);
    this.onTaskComplete = this.onTaskComplete.bind(this);
    this.onTaskDelete = this.onTaskDelete.bind(this);
    this.onTaskSchedule = this.onTaskSchedule.bind(this);
  }
  onTaskComplete() { /* completing stuff */ }
  onTaskDelete() { /* deleting stuff */ }
  onTaskSchedule() { /* scheduling stuff */ }

  render() {
    const { tasks } = this.props;

    return tasks.map(task => (
      <Task
        task={task}
        onTaskComplete={this.onTaskComplete}
        onTaskDelete={this.onTaskDelete}
        onTaskSchedule={this.onTaskSchedule}
      />
    ));
  }
}
```

Into looking like that (parent):
```
/* AFTER */
class TaskList extends React.Component {
  constructor(props) {
    super(props);
  }
  onTaskComplete() { /* completing stuff */ }
  onTaskDelete() { /* deleting stuff */ }
  onTaskSchedule() { /* scheduling stuff */ }

  render() {
    const { tasks } = this.props;

    return tasks.map(task => (
      <Task
        task={task}
        delegate={this}
      />
    ));
  }
}
```

# Simple setup (child)
And it is super easy to set up in the Task component (child)
```

import { setupDelegate } from 'react-delegate';
class Task extends React.Component {
  constructor(props) {
    super(props);
    setupDelegate(this, 'onTaskComplete', 'onTaskDelete', 'onTaskSchedule');
  }

  render() {
    const { task } = this.props;
    return (
      <div onClick={this.onTaskComplete}>
        {task.title}
      </div>
    )
  }
}
```

OBS: if the delegate does not implement a function nothing will happen and we will ignore the call.

# Advanced setup (child)

Sometimes you need to send properties back to the parent like taskId or the task itself.

TaskList wants to receive arguments (parent)
```
class TaskList extends React.Component {
  ...
  onTaskComplete(taskId, task, e) {
    // here you get the arguments from below
  }
  ...
}
```
This can be achieved in two ways.
## 1. setGlobals (child)
You can call setGlobals and prepend arguments to all the delegate calls.
This is useful in a class like Task that want to send which task is being completed, deleted or scheduled.
```
import { setupDelegate } from 'react-delegate';
class Task extends React.Component {
  constructor(props) {
    super(props);
    setupDelegate(this, 'onTaskComplete', 'onTaskDelete', 'onTaskSchedule').setGlobals(task.id, task);
    // Now all calls to these methods will send task.id and task as the first two arguments.
  }

  render() {
    const { task } = this.props;
    return (
      <div onClick={this.onTaskComplete}>
        {task.title}
      </div>
    )
  }
}
```

## 2. ...Cached version (child)
Each method you setup gets a cached version as well that you can pass parameters to.
This is great if you need to reuse a callback for multiple purposes or multiple rows.
```
import { setupDelegate } from 'react-delegate';
class Task extends React.Component {
  constructor(props) {
    super(props);
    setupDelegate(this, 'onTaskComplete', 'onTaskDelete', 'onTaskSchedule');
    // This sets up a this.onTaskCompleteCached that take arguments.
  }

  render() {
    const { task } = this.props;
    return (
      <div onClick={this.onTaskCompleteCached(task.id, task)}>
        {task.title}
      </div>
    )
  }
}
```
The arguments will be added before any standard arguments like the event (e).

OBS: The first argument to the cached methods acts as a key. This is to avoid creating a new function all the time on render. So make sure that if you render a list of tasks etc, to use a unique key as the first argument.
