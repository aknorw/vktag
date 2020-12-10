# VKtag

> Opinionated audio files tagger 🤖

## Installation

To avoid installing `node` on your computer, executables for all 3 major platforms are available from the [Releases](https://github.com/aknorw/vktag/releases) page.

Download the one you need and follow the instructions in your terminal to be able to call this tool whenever you are in your file system.

### Linux / Mac OS

```sh
# Navigate to your downloads folder (please change the path accordingly).
cd ~/Downloads

# Move the binary to avoid deleting it by accident.
mv vktag-macos ~/vktag

# Symlink the binary.
ln -s ~/vktag /usr/local/bin
```

### Windows

Move the executable somewhere you won't delete it by accident, and follow these [instructions](https://stackoverflow.com/a/41895179).

## Usage

You can simply run `vktag` from a terminal and follow the instructions.

If you want to avoid typing everything, you can also pass parameters:

```sh
vktag --releaseId 1727592 --folder "~/Music/Jean Michel Jean Louis ‎- Jean Michel Jean Louis"
```

| Parameter   | Alias | Default value             | Description                                                                 |
| ----------- | ----- | ------------------------- | --------------------------------------------------------------------------- |
| `releaseId` | `r`   | -                         | Release ID from Discogs                                                     |
| `folder`    | `f`   | Current working directory | Folder on your file system where the tracks you want to tag are located     |
| `threshold` | `t`   | `0.5`                     | Threshold used to match tracks from Discogs to the ones on your file system |
| `answerYes` | `y`   | -                         | Accept every prompt                                                         |

If you know what you're doing, tagging files is fast and easy:

```sh
vktag -r 6550974 -f "~/Music/Fernando Girao -– Africana" -y
```
