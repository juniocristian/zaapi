import React, { useState, useEffect, useRef, useContext } from "react";
import { useHistory, useParams } from "react-router-dom";
import { parseISO, format, isSameDay } from "date-fns";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { green, grey, red, blue } from "@material-ui/core/colors";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import Divider from "@material-ui/core/Divider";
import Badge from "@material-ui/core/Badge";
import Box from "@material-ui/core/Box";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import MarkdownWrapper from "../MarkdownWrapper";
import { Tooltip } from "@material-ui/core";
import { AuthContext } from "../../context/Auth/AuthContext";
import { TicketsContext } from "../../context/Tickets/TicketsContext";
import toastError from "../../errors/toastError";
import { v4 as uuidv4 } from "uuid";
import RoomIcon from '@material-ui/icons/Room';
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import AndroidIcon from "@material-ui/icons/Android";
import VisibilityIcon from "@material-ui/icons/Visibility";
import TicketMessagesDialog from "../TicketMessagesDialog";
import DoneIcon from '@material-ui/icons/Done';
import ClearOutlinedIcon from '@material-ui/icons/ClearOutlined';
import contrastColor from "../../helpers/contrastColor";
import ContactTag from "../ContactTag";

const useStyles = makeStyles((theme) => ({
  ticket: {
    position: "relative",
  },
  pendingTicket: {
    cursor: "unset",
  },
  queueTag: {
    background: "#FCFCFC",
    color: "#000",
    marginRight: 1,
    padding: 1,
    fontWeight: 'bold',
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 3,
    fontSize: "0.8em",
    whiteSpace: "nowrap"
  },
  // ... Adicione estilos para dispositivos móveis conforme necessário
  '@media (max-width: 600px)': {
    ticket: {
      flexDirection: 'column',
    },
    acceptButton: {
      left: 'unset',
      margin: '10px auto',
    },
    // Adicione mais estilos conforme necessário
  },
}));

const TicketListItemCustom = ({ handleChangeTab, ticket }) => {
  const classes = useStyles();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [ticketUser, setTicketUser] = useState(null);
  const [ticketQueueName, setTicketQueueName] = useState(null);
  const [ticketQueueColor, setTicketQueueColor] = useState(null);
  const [tag, setTag] = useState([]);
  const [whatsAppName, setWhatsAppName] = useState(null);
  const [openTicketMessageDialog, setOpenTicketMessageDialog] = useState(false);
  const { ticketId } = useParams();
  const isMounted = useRef(true);
  const { setCurrentTicket } = useContext(TicketsContext);
  const { user } = useContext(AuthContext);
  const { profile } = user;

  useEffect(() => {
    if (ticket.userId && ticket.user) {
      setTicketUser(ticket.user?.name?.toUpperCase());
    }
    setTicketQueueName(ticket.queue?.name?.toUpperCase());
    setTicketQueueColor(ticket.queue?.color);

    if (ticket.whatsappId && ticket.whatsapp) {
      setWhatsAppName(ticket.whatsapp.name?.toUpperCase());
    }

    setTag(ticket?.tags);

    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleCloseTicket = async (id) => {
    setTag(ticket?.tags);
    setLoading(true);
    try {
      await api.put(`/tickets/${id}`, {
        status: "closed",
        userId: user?.id,
        queueId: ticket?.queue?.id,
      });
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
    if (isMounted.current) {
      setLoading(false);
    }
    history.push(`/tickets/`);
  };

  const handleReopenTicket = async (id) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${id}`, {
        status: "open",
        userId: user?.id,
        queueId: ticket?.queue?.id,
      });
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
    if (isMounted.current) {
      setLoading(false);
    }
    history.push(`/tickets/`);
  };

  const handleAcepptTicket = async (id) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${id}`, {
        status: "open",
        userId: user?.id,
      });

      let settingIndex;

      try {
        const { data } = await api.get("/settings/");
        settingIndex = data.filter((s) => s.key === "sendGreetingAccepted");
      } catch (err) {
        toastError(err);
      }

      if (settingIndex[0].value === "enabled" && !ticket.isGroup) {
        handleSendMessage(ticket.id);
      }
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
    if (isMounted.current) {
      setLoading(false);
    }

    handleChangeTab(null, "open");
    history.push(`/tickets/${ticket.uuid}`);
  };

  const handleSendMessage = async (id) => {
    const msg = `{{ms}} *{{name}}*, meu nome é ${user?.name} e agora vou prosseguir com seu atendimento!; const message = { read: 1, fromMe: true, mediaUrl: "", body: Mensagem Automática:\n${msg.trim()}, }; try { await api.post(/messages/${id}`, message);
} catch (err) {
toastError(err);
}
};

const handleSelectTicket = (ticket) => {
const code = uuidv4();
const { id, uuid } = ticket;
setCurrentTicket({ id, uuid, code });
};

const renderTicketInfo = () => {
if (ticketUser) {
return (
<>
{ticket.chatbot && (
<Tooltip title="Chatbot">
<AndroidIcon
fontSize="small"
style={{ color: grey[700], marginRight: 5 }}
/>
</Tooltip>
)}
</>
);
} else {
return (
<>
{ticket.chatbot && (
<Tooltip title="Chatbot">
<AndroidIcon
fontSize="small"
style={{ color: grey[700], marginRight: 5 }}
/>
</Tooltip>
)}
</>
);
}
};

return (
<React.Fragment key={ticket.id}>
<TicketMessagesDialog
open={openTicketMessageDialog}
handleClose={() => setOpenTicketMessageDialog(false)}
ticketId={ticket.id}
></TicketMessagesDialog>
<ListItem
dense
button
onClick={(e) => {
if (ticket.status === "pending") return;
handleSelectTicket(ticket);
}}
selected={ticketId && +ticketId === ticket.id}
className={clsx(classes.ticket, {
[classes.pendingTicket]: ticket.status === "pending",
})}
>
<Tooltip arrow placement="right" title={ticket.queue?.name?.toUpperCase() || "SEM FILA"} >
<span style={{ backgroundColor: ticket.queue?.color || "#7C7C7C" }} className={classes.ticketQueueColor}></span>
</Tooltip>
<ListItemAvatar>
{ticket.status !== "pending" ?
<Avatar
style={{
marginTop: "3px",
marginLeft: "-8px",
width: "60px",
height: "60px",
borderRadius: "50%",
}}
src={ticket?.contact?.profilePicUrl}
/>
:
<Avatar
style={{
marginTop: "3px",
marginLeft: "-8px",
width: "60px",
height: "60px",
borderRadius: "50%",
border: "2px solid #2a6a5a",
}}
src={ticket?.contact?.profilePicUrl}
/>
}
</ListItemAvatar>
<ListItemText
disableTypography
primary={
<span className={classes.contactNameWrapper}>
<Typography
             noWrap
             component="span"
             variant="body2"
             color="textPrimary"
           >
{ticket.contact.name}
{profile === "admin" && (
<Tooltip title="Espiar Conversa">
<VisibilityIcon
onClick={() => setOpenTicketMessageDialog(true)}
fontSize="small"
style={{
color: 'rgb(255, 255, 255)',
backgroundColor: '#2a6a5a',
cursor: 'pointer',
padding: '2px',
height: '23px',
width: '23px',
fontSize: '12px',
borderRadius: '50px',
right: '159px',
top: '47px',
position: 'absolute',
}}
/>
</Tooltip>
)}
</Typography>
<ListItemSecondaryAction>
<Box className={classes.ticketInfo1}>{renderTicketInfo()}</Box>
</ListItemSecondaryAction>
</span>
}
secondary={
<span className={classes.contactNameWrapper}>
<Typography
             className={classes.contactLastMessage}
             noWrap
             component="span"
             variant="body2"
             color="textSecondary"
           > {ticket.lastMessage.includes('data:image/png;base64') ? <MarkdownWrapper> Localização</MarkdownWrapper> : <MarkdownWrapper>{ticket.lastMessage}</MarkdownWrapper>}
<span className={classes.secondaryContentSecond} >
{ticket?.whatsapp?.name ? <Badge className={classes.connectionTag}>{ticket?.whatsapp?.name?.toUpperCase()}</Badge> : <br></br>}
{ticketUser ? <Badge style={{ backgroundColor: "#000000" }} className={classes.connectionTag}>{ticketUser}</Badge> : <br></br>}
<Badge style={{ backgroundColor: ticket.queue?.color || "#7c7c7c" }} className={classes.connectionTag}>{ticket.queue?.name?.toUpperCase() || "SEM FILA"}</Badge>
</span>
<span style={{ paddingTop: "2px" }} className={classes.secondaryContentSecond} >
{tag?.map((tag) => {
return (
<ContactTag tag={tag} key={ticket-contact-tag-${ticket.id}-${tag.id}} />
);
})}
</span>
</Typography>
<Badge
className={classes.newMessagesCount}
badgeContent={ticket.unreadMessages}
classes={{
badge: classes.badgeStyle,
}}
/>
</span>
}
/>
<ListItemSecondaryAction>
{ticket.lastMessage && (
<>
<Typography
             className={classes.lastMessageTime}
             component="span"
             variant="body2"
             color="textSecondary"
           >
{isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
<>{format(parseISO(ticket.updatedAt), "HH:mm")}</>
) : (
<>{format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}</>
)}
</Typography>
<br />
</>
)}
</ListItemSecondaryAction>
<span className={classes.secondaryContentSecond} >
{ticket.status === "pending" && (
<ButtonWithSpinner
style={{ left: '462px', color: 'rgb(255, 255, 255)', backgroundColor: '#2a6a5a', cursor: 'pointer', padding: '2px', height: '23px', width: '23px', fontSize: '12px', borderRadius: '50px', top: '47px', position: 'absolute' }}
              variant="contained"
              className={classes.acceptButton}
              size="small"
              loading={loading}
              onClick={e => handleAcepptTicket(ticket.id, handleChangeTab)}
            >
              {i18n.t("ticketsList.buttons.accept")}
            </ButtonWithSpinner>
          )}
          {(ticket.status !== "closed") && (
            <ButtonWithSpinner
              style={{ color: 'rgb(255, 255, 255)', backgroundColor: '#2a6a5a', cursor: 'pointer', padding: '2px', height: '23px', width: '23px', fontSize: '12px', borderRadius: '50px', left: '390px', top: '47px', position: 'absolute' }}
              variant="contained"
              className={classes.acceptButton}
              size="small"
              loading={loading}
              onClick={e => handleCloseTicket(ticket.id)}
            >
              {i18n.t("ticketsList.buttons.closed")}
            </ButtonWithSpinner>
          )}
          {(ticket.status === "closed") && (
            <ButtonWithSpinner
              style={{ color: 'rgb(255, 255, 255)', backgroundColor: '#2a6a5a', cursor: 'pointer', padding: '2px', height: '23px', width: '23px', fontSize: '12px', borderRadius: '50px', left: '392px', top: '47px', position: 'absolute' }}
              variant="contained"
              className={classes.acceptButton}
              size="small"
              loading={loading}
              onClick={e => handleReopenTicket(ticket.id)}
            >
              {i18n.t("ticketsList.buttons.reopen")}
            </ButtonWithSpinner>
          )}
        </span>
      </ListItem>
      <Divider variant="inset" component="li" />
    </React.Fragment>
  );
};

export default TicketListItemCustom;

