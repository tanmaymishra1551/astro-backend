PGDMP          
            }            astrocharyaji    14.11    16.6 2    ;           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            <           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            =           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            >           1262    18412    astrocharyaji    DATABASE     �   CREATE DATABASE astrocharyaji WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_India.1252';
    DROP DATABASE astrocharyaji;
                postgres    false                        2615    2200    public    SCHEMA     2   -- *not* creating schema, since initdb creates it
 2   -- *not* dropping schema, since initdb creates it
                postgres    false            ?           0    0    SCHEMA public    ACL     Q   REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;
                   postgres    false    4            �            1259    18506    activity_logs    TABLE     �   CREATE TABLE public.activity_logs (
    id integer NOT NULL,
    admin_id integer,
    user_id integer,
    action text NOT NULL,
    "timestamp" timestamp without time zone DEFAULT now()
);
 !   DROP TABLE public.activity_logs;
       public         heap    postgres    false    4            �            1259    18505    activity_logs_id_seq    SEQUENCE     �   CREATE SEQUENCE public.activity_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.activity_logs_id_seq;
       public          postgres    false    4    215            @           0    0    activity_logs_id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public.activity_logs_id_seq OWNED BY public.activity_logs.id;
          public          postgres    false    214            �            1259    18468    astrologer_details    TABLE     .  CREATE TABLE public.astrologer_details (
    astrologer_id integer NOT NULL,
    specialization text NOT NULL,
    experience integer,
    availability jsonb DEFAULT '{}'::jsonb,
    pricing numeric(10,2),
    verification_status boolean DEFAULT false,
    profile_picture text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT astrologer_details_experience_check CHECK ((experience >= 0)),
    CONSTRAINT astrologer_details_pricing_check CHECK ((pricing >= (0)::numeric))
);
 &   DROP TABLE public.astrologer_details;
       public         heap    postgres    false    4            �            1259    26747    bookings    TABLE     S  CREATE TABLE public.bookings (
    booking_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id integer NOT NULL,
    astrologer_id integer NOT NULL,
    time_slot timestamp without time zone NOT NULL,
    status character varying(10) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT bookings_status_check CHECK (((status)::text = ANY ((ARRAY['booked'::character varying, 'pending'::character varying, 'canceled'::character varying])::text[])))
);
    DROP TABLE public.bookings;
       public         heap    postgres    false    4            �            1259    18487    roles    TABLE     e   CREATE TABLE public.roles (
    id integer NOT NULL,
    role_name character varying(50) NOT NULL
);
    DROP TABLE public.roles;
       public         heap    postgres    false    4            �            1259    18486    roles_id_seq    SEQUENCE     �   CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.roles_id_seq;
       public          postgres    false    213    4            A           0    0    roles_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;
          public          postgres    false    212            �            1259    18546 
   time_slots    TABLE     F  CREATE TABLE public.time_slots (
    id integer NOT NULL,
    astrologer_id integer NOT NULL,
    slot_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    status character varying(10) DEFAULT 'available'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT time_slots_status_check CHECK (((status)::text = ANY ((ARRAY['available'::character varying, 'booked'::character varying])::text[])))
);
    DROP TABLE public.time_slots;
       public         heap    postgres    false    4            �            1259    18545    time_slots_id_seq    SEQUENCE     �   CREATE SEQUENCE public.time_slots_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.time_slots_id_seq;
       public          postgres    false    217    4            B           0    0    time_slots_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.time_slots_id_seq OWNED BY public.time_slots.id;
          public          postgres    false    216            �            1259    18428    users    TABLE     	  CREATE TABLE public.users (
    id integer NOT NULL,
    fullname character varying(50) NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    role character varying(20) NOT NULL,
    password text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    refresh_token text,
    phone character varying(20),
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    updated_at timestamp without time zone DEFAULT now()
);
    DROP TABLE public.users;
       public         heap    postgres    false    4            �            1259    18427    users_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public          postgres    false    210    4            C           0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public          postgres    false    209            |           2604    18509    activity_logs id    DEFAULT     t   ALTER TABLE ONLY public.activity_logs ALTER COLUMN id SET DEFAULT nextval('public.activity_logs_id_seq'::regclass);
 ?   ALTER TABLE public.activity_logs ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    214    215    215            {           2604    18490    roles id    DEFAULT     d   ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);
 7   ALTER TABLE public.roles ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    212    213    213            ~           2604    18549    time_slots id    DEFAULT     n   ALTER TABLE ONLY public.time_slots ALTER COLUMN id SET DEFAULT nextval('public.time_slots_id_seq'::regclass);
 <   ALTER TABLE public.time_slots ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    217    216    217            s           2604    18431    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    210    209    210            5          0    18506    activity_logs 
   TABLE DATA           S   COPY public.activity_logs (id, admin_id, user_id, action, "timestamp") FROM stdin;
    public          postgres    false    215   �?       1          0    18468    astrologer_details 
   TABLE DATA           �   COPY public.astrologer_details (astrologer_id, specialization, experience, availability, pricing, verification_status, profile_picture, created_at, updated_at) FROM stdin;
    public          postgres    false    211   �?       8          0    26747    bookings 
   TABLE DATA           q   COPY public.bookings (booking_id, user_id, astrologer_id, time_slot, status, created_at, updated_at) FROM stdin;
    public          postgres    false    218   �@       3          0    18487    roles 
   TABLE DATA           .   COPY public.roles (id, role_name) FROM stdin;
    public          postgres    false    213   IA       7          0    18546 
   time_slots 
   TABLE DATA           x   COPY public.time_slots (id, astrologer_id, slot_date, start_time, end_time, status, created_at, updated_at) FROM stdin;
    public          postgres    false    217   �A       0          0    18428    users 
   TABLE DATA           �   COPY public.users (id, fullname, username, email, role, password, created_at, refresh_token, phone, status, updated_at) FROM stdin;
    public          postgres    false    210   �A       D           0    0    activity_logs_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.activity_logs_id_seq', 1, false);
          public          postgres    false    214            E           0    0    roles_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.roles_id_seq', 3, true);
          public          postgres    false    212            F           0    0    time_slots_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.time_slots_id_seq', 5, true);
          public          postgres    false    216            G           0    0    users_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.users_id_seq', 47, true);
          public          postgres    false    209            �           2606    18514     activity_logs activity_logs_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.activity_logs DROP CONSTRAINT activity_logs_pkey;
       public            postgres    false    215            �           2606    18480 *   astrologer_details astrologer_details_pkey 
   CONSTRAINT     s   ALTER TABLE ONLY public.astrologer_details
    ADD CONSTRAINT astrologer_details_pkey PRIMARY KEY (astrologer_id);
 T   ALTER TABLE ONLY public.astrologer_details DROP CONSTRAINT astrologer_details_pkey;
       public            postgres    false    211            �           2606    26756    bookings bookings_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (booking_id);
 @   ALTER TABLE ONLY public.bookings DROP CONSTRAINT bookings_pkey;
       public            postgres    false    218            �           2606    18492    roles roles_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.roles DROP CONSTRAINT roles_pkey;
       public            postgres    false    213            �           2606    18494    roles roles_role_name_key 
   CONSTRAINT     Y   ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_role_name_key UNIQUE (role_name);
 C   ALTER TABLE ONLY public.roles DROP CONSTRAINT roles_role_name_key;
       public            postgres    false    213            �           2606    18555    time_slots time_slots_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.time_slots
    ADD CONSTRAINT time_slots_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.time_slots DROP CONSTRAINT time_slots_pkey;
       public            postgres    false    217            �           2606    18441    users users_email_key 
   CONSTRAINT     Q   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
 ?   ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key;
       public            postgres    false    210            �           2606    18526    users users_phone_key 
   CONSTRAINT     Q   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);
 ?   ALTER TABLE ONLY public.users DROP CONSTRAINT users_phone_key;
       public            postgres    false    210            �           2606    18437    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public            postgres    false    210            �           2606    18439    users users_username_key 
   CONSTRAINT     W   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);
 B   ALTER TABLE ONLY public.users DROP CONSTRAINT users_username_key;
       public            postgres    false    210            �           2606    18515 )   activity_logs activity_logs_admin_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id) ON DELETE SET NULL;
 S   ALTER TABLE ONLY public.activity_logs DROP CONSTRAINT activity_logs_admin_id_fkey;
       public          postgres    false    215    210    3215            �           2606    18520 (   activity_logs activity_logs_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 R   ALTER TABLE ONLY public.activity_logs DROP CONSTRAINT activity_logs_user_id_fkey;
       public          postgres    false    215    210    3215            �           2606    18481 8   astrologer_details astrologer_details_astrologer_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.astrologer_details
    ADD CONSTRAINT astrologer_details_astrologer_id_fkey FOREIGN KEY (astrologer_id) REFERENCES public.users(id) ON DELETE CASCADE;
 b   ALTER TABLE ONLY public.astrologer_details DROP CONSTRAINT astrologer_details_astrologer_id_fkey;
       public          postgres    false    3215    210    211            �           2606    18556    time_slots fk_astrologer    FK CONSTRAINT     �   ALTER TABLE ONLY public.time_slots
    ADD CONSTRAINT fk_astrologer FOREIGN KEY (astrologer_id) REFERENCES public.astrologer_details(astrologer_id);
 B   ALTER TABLE ONLY public.time_slots DROP CONSTRAINT fk_astrologer;
       public          postgres    false    211    217    3219            �           2606    26762    bookings fk_astrologer    FK CONSTRAINT     �   ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT fk_astrologer FOREIGN KEY (astrologer_id) REFERENCES public.astrologer_details(astrologer_id) ON DELETE CASCADE;
 @   ALTER TABLE ONLY public.bookings DROP CONSTRAINT fk_astrologer;
       public          postgres    false    3219    218    211            �           2606    26757    bookings fk_user    FK CONSTRAINT     �   ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 :   ALTER TABLE ONLY public.bookings DROP CONSTRAINT fk_user;
       public          postgres    false    218    210    3215            5      x������ � �      1   �   x�}���0��ۧh:C���$��訃:���@M$�w1�.'��w�m�V|3��u��#�����A!<��u9ÏB�A�-)".T�b����[v��Q�V����Rkp�O&I��}ge��ď��vVɛo������	��LI�Q�$cowz5J      8   �   x���;n�0Dk�{ÏDJgI#�t�f��WQ���6�<`ތ��y�J�׋Lg���)pk6Qzn��&�JP��8�b �o�����?k/�C0���TZe���sr�I:2�֢��j"��|�/	dGu�x@%ώ$� �O�y\+���i�ćr���l��������(R      3   +   x�3�LL����2�L,.)���OO-�2�L�K�/-2c���� �S      7   E   x�3�42�4202�50�50�44�2 !NCC(#�,13'1)'��L(kdheb�g`hbfn�G�+F��� 8�f      0   
  x���[s�J���W�0�!Mw�O��FATj�RrQ�D��ə�eNR���VV}���F��8xyG�$^��c3H}'�MSN��~���4�!#kϩ�q� WCQݥj��K��[+�%�~2;���V��i��Wu�<�D���2�K�`�iy���#'Pi�8�i%��qcv�W�@�f��j���e��E��+�Q�S`���8�*�U�U�;f�Q�0{�i�C���6ֻ������z���xE2z�[����)����0d;v!�"Ha�̴�����n��͡ȳ8�]��ѳ��"F��9(�,{�x�<�C	- r������bW#N��5x`�I
p��w��jU���� ��P����#X���c�)�KczN6TIOOw�DT�Ǌ.���"ס�.b���XDx�nC��Ł�u��OY��\F�ן^�I��������$.XϲތIaKU_��Z6GxR��_�ӀW�'ױB�e�����i��b�K5�̵��*�7�ӂ�sl�#�y9*-כ�v�?P
��ڝr��!����}m���֪��14��2�BB�}�7B���������씶����Gܡ޸I���*Cd��r�{���Ue�r�zIBж��^������V�!��^���]�E�r�u�\K,�Mڙm�a�]��۽�+��?Лa�<yXw��b�"4	s�� �2�'���_���.+�#d^+l�{�d�_��-��6_���S��sP˨>
[���x�|�ا�u����Ll�Rע� 0�������S�U�9�F���]�O�Y�!�&�=3��Q�]Q�mPL\�Y��y�uP���r|����Y��0�L���x�aѷ=����V~!��B���E�",X�3�M}����)ғs�
�@mB��D�Ǟ�w1MqM�~�g��Cs�z�;Maw陽E2W�����9	OK���I�g$|JPl���'p����="
����-ErEw+o(z����}�L|�{p	(�c±M(��l<5Z"] ��2̥1�����K�����}���Ξq�y��a�\�js���|�ؼ������<g������caaa
"L�}������cC���a3<�Nr�87�]$C$V��ZM��*�|2Y�xI�=�L�K��l`�Sv���宬�
�V~p3a�OL�D��%�VE��p|Y�#׹JYJ��$d?1��)��7z�ל��ío7灞TC�����j,�ȈuC��h����z�G�A���.��I�_E��f��t;_K����E��� �T>�     