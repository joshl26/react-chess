import { useDispatch, useSelector } from 'react-redux';
import BarChartIcon from '@mui/icons-material/BarChart';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import MoveDownIcon from '@mui/icons-material/MoveDown';
import VideoCameraBackIcon from '@mui/icons-material/VideoCameraBack';
import WidgetsIcon from '@mui/icons-material/Widgets';
import { IconButton, Stack } from "@mui/material";
import { getActiveMode } from 'app/store';
import Movetext from 'common/Movetext';
import * as warningAlert from 'features/alert/warningAlertSlice';
import * as variantConst from 'features/mode/variantConst';
import * as panel from 'features/panel/panelSlice';
import * as progressDialog from 'features/progressDialogSlice';

const Buttons = () => {
  const state = useSelector(state => state);

  const dispatch = useDispatch();

  const handleDownloadImage = async () => {
    await fetch(`https://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/download/image`, {
      method: 'POST',
      body: JSON.stringify({
        fen: state.board.fen[state.board.fen.length - 1 + state.panel.history.back],
        variant: getActiveMode().variant,
        flip: state.board.flip
      })
    }).then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "chessboard.png";
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
  }

  const handleDownloadMp4 = async () => {
    dispatch(progressDialog.open());
    await fetch(`https://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/download/mp4`, {
      method: 'POST',
      body: JSON.stringify({
        variant: getActiveMode().variant,
        fen: state.board.fen[0],
        movetext: Movetext.substring(state.board.movetext, state.panel.history.back),
        flip: state.board.flip,
        ...(getActiveMode().variant === variantConst.CHESS_960) && {startPos: state.fenMode.startPos},
        ...(getActiveMode().variant === variantConst.CAPABLANCA_FISCHER) && {startPos: state.fenMode.startPos},
        ...(state.fenMode.active) && {fen: state.fenMode.fen}
      })
    })
    .then(res => res.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "chessgame.mp4";
      document.body.appendChild(a);
      a.click();
      a.remove();
    })
    .finally(() => dispatch(progressDialog.close()));
  }

  const handleHeuristics = async () => {
    dispatch(progressDialog.open());
    await fetch(`https://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/heuristics`, {
      method: 'POST',
      body: JSON.stringify({
        variant: getActiveMode().variant,
        movetext: Movetext.substring(state.board.movetext, state.panel.history.back),
        ...(getActiveMode().variant === variantConst.CHESS_960) && {startPos: state.fenMode.startPos},
        ...(getActiveMode().variant === variantConst.CAPABLANCA_FISCHER) && {startPos: state.fenMode.startPos},
        ...(state.fenMode.active) && {fen: state.board.fen[0]},
        ...(state.stockfishMode.active) && {fen: state.board.fen[0]}
      })
    })
    .then(res => res.json())
    .then(res => {
      dispatch(panel.heuristicsDialog({
        open: true,
        heuristics: res
      }));
    })
    .catch(error => {
      dispatch(warningAlert.show({ mssg: 'Whoops! Something went wrong, please try again.' }));
    })
    .finally(() => {
      dispatch(progressDialog.close());
    });
  }

  if (!state.ravMode.active) {
    return (
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
      >
        <IconButton
          size="large"
          id="Buttons-copyMovetext"
          disabled={!state.board.movetext}
          color="primary"
          title="Copy movetext"
          aria-label="copy"
          onClick={() => navigator.clipboard.writeText(Movetext.substring(state.board.movetext, state.panel.history.back))}
        >
          <MoveDownIcon />
        </IconButton>
        <IconButton
          size="large"
          id="Buttons-copyFenString"
          color="primary"
          title="Copy FEN string"
          aria-label="fen"
          onClick={() => navigator.clipboard.writeText(state.board.fen[state.board.fen.length - 1 + state.panel.history.back])}
        >
          <WidgetsIcon />
        </IconButton>
        <IconButton
          size="large"
          id="Buttons-heuristics"
          disabled={!state.board.movetext}
          color="primary"
          title="Heuristics"
          aria-label="heuristics"
          onClick={() => handleHeuristics()}
        >
          <BarChartIcon />
        </IconButton>
        <IconButton
          size="large"
          id="Buttons-downloadImage"
          color="primary"
          title="Download Image"
          aria-label="flip"
          onClick={() => handleDownloadImage()}
        >
          <InsertPhotoIcon />
        </IconButton>
        <IconButton
          size="large"
          id="Buttons-downloadVideo"
          disabled={!state.board.movetext}
          color="primary"
          title="Download Video"
          aria-label="flip"
          onClick={() => handleDownloadMp4()}
        >
          <VideoCameraBackIcon />
        </IconButton>
      </Stack>
    );
  }
}

export default Buttons;
